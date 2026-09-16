from __future__ import annotations

import logging
import time
from datetime import date, timedelta

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from db.session import get_session
from db.price_cache import TickerNotFoundError, get_adj_close
from api.schemas.market_models import (
    ConfidenceLevelResult,
    CorrelationMatrix,
    CrisisWindowPreset,
    DiversificationResult,
    DrawdownResult,
    ErrorCode,
    ErrorResponse,
    MarketRiskAnalyzeRequest,
    MarketRiskAnalyzeResponse,
    MethodBacktest,
    MethodResults,
    PortfolioSummary,
    StressScenarioMode,
    StressTestRequest,
    StressTestResult,
    TimeSeries,
    VarEsPair,
    VolatilityForecast,
)
from engines.market_risk.market_risk_service import (
    GarchConvergenceError,
    categorize_stress_result,
    compute_correlation,
    compute_diversification,
    compute_drawdown,
    compute_ewma_volatility,
    compute_log_returns,
    compute_portfolio_returns,
    fit_garch_volatility,
    historical_scenario_pnl,
    hypothetical_scenario_pnl,
    run_backtest,
    score_method,
)

from api.schemas.market_models import TickerListResponse
from api.ticker_registry import TICKER_REGISTRY

router = APIRouter(prefix="/api/market-risk", tags=["market-risk"])
logger = logging.getLogger("market_risk.debug")
logger.setLevel(logging.INFO)
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("[market-risk] %(message)s"))
    logger.addHandler(_handler)
    logger.propagate = False


@router.get("/tickers", response_model=TickerListResponse)
def list_tickers():
    return TickerListResponse(tickers=TICKER_REGISTRY)


CRISIS_WINDOWS: dict[str, tuple[date, date]] = {
    "2020": (date(2020, 1, 1), date(2020, 12, 31)),
    "2022": (date(2022, 1, 1), date(2022, 12, 31)),
}
# Fetch/backtest history is always this long, regardless of crisis_window: the full
# backtest (Kupiec/Christoffersen/CC) needs the whole sample, and crisis_window only
# selects a slice of the chart afterwards — it must never change what gets fetched.
FULL_HISTORY_YEARS = 15
MIN_HISTORY_DAYS = 300  # below this, EWMA/GARCH/rolling backtest can't seed properly

# In-memory cache of the fully COMPUTED analysis bundle (GARCH fit + rolling backtest
# over the full history). Keyed only by inputs that actually change the computation —
# crisis_window/custom_window are deliberately excluded, since they only pick a slice of
# the already-computed series for the chart and must not trigger a recompute.
_CACHE: dict[tuple, tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = 60 * 30


def _cache_key(req: MarketRiskAnalyzeRequest) -> tuple:
    return (
        tuple(sorted(req.tickers)),
        req.portfolio_value,
        req.estimation_window_days,
        tuple(req.confidence_levels),
    )


def _resolve_window(req: MarketRiskAnalyzeRequest) -> tuple[date, date]:
    if req.crisis_window == CrisisWindowPreset.custom:
        return req.custom_window.start, req.custom_window.end
    return CRISIS_WINDOWS[req.crisis_window.value]


def _compute_bundle(req: MarketRiskAnalyzeRequest, session: Session) -> dict:
    """Fetch the full price history and run the full backtest once. Independent of
    crisis_window — every method's Kupiec/Christoffersen/CC score is computed over the
    entire available sample, matching the notebook's `estimation_window` reference run."""
    fetch_start = date.today() - timedelta(days=FULL_HISTORY_YEARS * 365)
    # Never chase today's still-in-progress session: yfinance's data for it is
    # unpublished/flaky until the market closes, and every cache-key miss (e.g.
    # switching estimation_window_days) would otherwise re-attempt that same
    # unreliable single-day gap.
    fetch_end = date.today() - timedelta(days=1)

    try:
        adj_close = get_adj_close(session, req.tickers, fetch_start, fetch_end)
    except TickerNotFoundError as exc:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                code=ErrorCode.ticker_not_found,
                message=str(exc),
                details={"ticker": exc.ticker},
            ).model_dump(),
        ) from exc

    if len(adj_close) < req.estimation_window_days + MIN_HISTORY_DAYS:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                code=ErrorCode.insufficient_history,
                message=(
                    f"Only {len(adj_close)} trading days of overlapping history available; "
                    f"need at least {req.estimation_window_days + MIN_HISTORY_DAYS} for this "
                    "estimation window."
                ),
            ).model_dump(),
        )

    log_returns = compute_log_returns(adj_close)
    weights = np.full(len(req.tickers), 1 / len(req.tickers))
    portfolio_returns = compute_portfolio_returns(log_returns, weights)

    ewma_vol = compute_ewma_volatility(portfolio_returns)
    try:
        garch_vol = fit_garch_volatility(portfolio_returns)
    except GarchConvergenceError as exc:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                code=ErrorCode.garch_did_not_converge, message=str(exc)
            ).model_dump(),
        ) from exc

    backtest_raw = run_backtest(
        returns=portfolio_returns,
        portfolio_value=req.portfolio_value,
        estimation_window_days=req.estimation_window_days,
        confidence_levels=req.confidence_levels,
        ewma_vol=ewma_vol,
        garch_vol=garch_vol,
    )
    dates: pd.DatetimeIndex = backtest_raw["dates"]
    actual_pnl: np.ndarray = backtest_raw["actual_pnl"]

    # --- var_comparison: "today" = most recent point of each method's rolling series ---
    var_comparison: list[ConfidenceLevelResult] = []
    for cf in req.confidence_levels:
        methods = {}
        for method in ("historical", "parametric", "ewma", "garch", "monte_carlo"):
            var_last = backtest_raw["by_confidence"][cf][method]["var"][-1]
            es_last = backtest_raw["by_confidence"][cf][method]["es"][-1]
            methods[method] = VarEsPair(
                var=var_last,
                es=es_last,
                var_pct=var_last / req.portfolio_value,
                es_pct=es_last / req.portfolio_value,
            )
        var_comparison.append(
            ConfidenceLevelResult(confidence_level=cf, methods=MethodResults(**methods))
        )

    # --- backtest scoring, primary confidence level = the middle one (typically 0.95) ---
    primary_cf = sorted(req.confidence_levels)[len(req.confidence_levels) // 2]
    backtest_scores = {}
    for method in ("historical", "parametric", "ewma", "garch", "monte_carlo"):
        var_series = np.array(backtest_raw["by_confidence"][primary_cf][method]["var"])
        scored = score_method(actual_pnl, var_series, primary_cf)
        breach_dates = [
            d.date() for d, hit in zip(dates, scored.pop("hit_mask")) if hit
        ]
        backtest_scores[method] = {
            **scored,
            "breach_dates": breach_dates,
            "var_series": TimeSeries(
                dates=list(dates.date), values=var_series.tolist()
            ),
        }

    drawdown_raw = compute_drawdown(portfolio_returns, req.portfolio_value)
    diversification_raw = compute_diversification(
        log_returns, weights, req.portfolio_value, primary_cf
    )
    correlation_raw = compute_correlation(log_returns)

    return {
        "adj_close_start": adj_close.index[0].date(),
        "adj_close_end": adj_close.index[-1].date(),
        "weights": weights,
        "dates": dates,
        "actual_pnl": actual_pnl,
        "var_comparison": var_comparison,
        "volatility_forecast": {
            "dates": list(dates.date),
            "ewma": ewma_vol.reindex(dates).tolist(),
            "garch": garch_vol.reindex(dates).tolist(),
        },
        "backtest_scores": backtest_scores,
        "drawdown": drawdown_raw,
        "diversification": diversification_raw,
        "correlation": correlation_raw,
    }


def _get_bundle(req: MarketRiskAnalyzeRequest, session: Session) -> dict:
    cache_key = _cache_key(req)
    cached = _CACHE.get(cache_key)
    if cached and (time.time() - cached[0]) < _CACHE_TTL_SECONDS:
        logger.info("bundle cache HIT key=%s", cache_key)
        return cached[1]
    logger.info("bundle cache MISS key=%s", cache_key)
    bundle = _compute_bundle(req, session)
    _CACHE[cache_key] = (time.time(), bundle)
    return bundle


@router.post("/analyze", response_model=MarketRiskAnalyzeResponse)
def analyze_market_risk(
    req: MarketRiskAnalyzeRequest, session: Session = Depends(get_session)
) -> MarketRiskAnalyzeResponse:
    logger.info(
        "analyze request tickers=%s window=%s confidence=%s",
        req.tickers,
        req.estimation_window_days,
        req.confidence_levels,
    )
    bundle = _get_bundle(req, session)
    logger.info(
        "bundle ready adj_close_range=%s..%s",
        bundle["adj_close_start"],
        bundle["adj_close_end"],
    )
    dates: pd.DatetimeIndex = bundle["dates"]
    actual_pnl: np.ndarray = bundle["actual_pnl"]

    # --- crisis_window is pure post-processing: slice the already-computed series,
    # never re-fetch or re-run the backtest for it ---
    if req.crisis_window is not None:
        crisis_start, crisis_end = _resolve_window(req)
    else:
        crisis_start, crisis_end = dates[0].date(), dates[-1].date()

    window_mask = (dates.date >= crisis_start) & (dates.date <= crisis_end)
    actual_pnl_chart = TimeSeries(
        dates=list(dates[window_mask].date), values=actual_pnl[window_mask].tolist()
    )

    drawdown_raw = bundle["drawdown"]

    response = MarketRiskAnalyzeResponse(
        portfolio=PortfolioSummary(
            tickers=req.tickers,
            weights=bundle["weights"].tolist(),
            value=req.portfolio_value,
            start_date=bundle["adj_close_start"],
            end_date=bundle["adj_close_end"],
        ),
        var_comparison=bundle["var_comparison"],
        actual_pnl=actual_pnl_chart,
        volatility_forecast=VolatilityForecast(**bundle["volatility_forecast"]),
        backtest=MethodBacktest(**bundle["backtest_scores"]),
        drawdown=DrawdownResult(
            dates=list(drawdown_raw["dates"].date),
            values=drawdown_raw["values"].tolist(),
            max_drawdown=drawdown_raw["max_drawdown"],
        ),
        diversification=DiversificationResult(**bundle["diversification"]),
        correlation_matrix=CorrelationMatrix(**bundle["correlation"]),
    )
    logger.info(
        "analyze response actual_pnl_points=%d portfolio_end=%s",
        len(actual_pnl_chart.dates),
        response.portfolio.end_date,
    )
    return response


# ---------------------------------------------------------------------------
# Stress testing — deliberately independent of /analyze's cache: it never needs the
# GARCH fit or the rolling backtest, just price history (already cached in Postgres)
# or, for the hypothetical mode, no market data at all.
# ---------------------------------------------------------------------------

# Tight, acute drawdown windows (not full calendar years like CRISIS_WINDOWS above) —
# these are the periods that actually define "what a crisis felt like" for a replay.
HISTORICAL_STRESS_WINDOWS: dict[str, tuple[date, date]] = {
    "2020": (date(2020, 2, 19), date(2020, 3, 20)),  # COVID crash
    "2022": (date(2021, 12, 27), date(2022, 10, 14)),  # rate-hike sell-off
}
STRESS_SCENARIO_LABELS: dict[str, str] = {
    "2020": "COVID-19 (19 feb – 20 mar 2020)",
    "2022": "Rate-hike sell-off (27 dec 2021 – 14 oct 2022)",
}
# Prefilled per-asset-class shocks offered alongside each historical replay — editable
# by the user, mirrored in the frontend for the initial form values.
PRESET_SHOCK_SCENARIOS: dict[str, dict[str, float]] = {
    "2020": {
        "equity": -0.30,
        "bond": -0.05,
        "commodity": 0.05,
        "fx": -0.03,
        "crypto": -0.50,
    },
    "2022": {
        "equity": -0.20,
        "bond": -0.13,
        "commodity": 0.00,
        "fx": -0.08,
        "crypto": -0.65,
    },
}
STRESS_WARNING_PCT = 0.15
STRESS_CRITICAL_PCT = 0.20

_TICKER_ASSET_CLASS: dict[str, str] = {t.symbol: t.asset_class for t in TICKER_REGISTRY}


@router.post("/stress-test", response_model=StressTestResult)
def stress_test(
    req: StressTestRequest, session: Session = Depends(get_session)
) -> StressTestResult:
    weights = np.full(len(req.tickers), 1 / len(req.tickers))

    if req.mode == StressScenarioMode.historical:
        if req.window == CrisisWindowPreset.custom:
            start, end = req.custom_window.start, req.custom_window.end
            label = f"Personalizat ({start.isoformat()} → {end.isoformat()})"
        else:
            start, end = HISTORICAL_STRESS_WINDOWS[req.window.value]
            label = STRESS_SCENARIO_LABELS[req.window.value]

        fetch_start = date.today() - timedelta(days=FULL_HISTORY_YEARS * 365)
        fetch_end = date.today() - timedelta(days=1)
        try:
            adj_close = get_adj_close(session, req.tickers, fetch_start, fetch_end)
        except TickerNotFoundError as exc:
            raise HTTPException(
                status_code=422,
                detail=ErrorResponse(
                    code=ErrorCode.ticker_not_found,
                    message=str(exc),
                    details={"ticker": exc.ticker},
                ).model_dump(),
            ) from exc

        log_returns = compute_log_returns(adj_close)
        portfolio_returns = compute_portfolio_returns(log_returns, weights)

        try:
            result = historical_scenario_pnl(
                portfolio_returns, start.isoformat(), end.isoformat(), req.portfolio_value
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=422,
                detail=ErrorResponse(
                    code=ErrorCode.insufficient_history, message=str(exc)
                ).model_dump(),
            ) from exc

        status = categorize_stress_result(
            result["pnl_pct"], STRESS_WARNING_PCT, STRESS_CRITICAL_PCT
        )
        return StressTestResult(
            mode=req.mode, label=label, start_date=start, end_date=end, status=status, **result
        )

    asset_classes = [_TICKER_ASSET_CLASS.get(t, "equity") for t in req.tickers]
    result = hypothetical_scenario_pnl(
        weights, asset_classes, req.shocks or {}, req.portfolio_value
    )
    status = categorize_stress_result(
        result["pnl_pct"], STRESS_WARNING_PCT, STRESS_CRITICAL_PCT
    )
    return StressTestResult(
        mode=req.mode,
        label="Scenariu ipotetic",
        status=status,
        shocks_applied=req.shocks,
        **result,
    )
