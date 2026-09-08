from __future__ import annotations

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
    TimeSeries,
    VarEsPair,
    VolatilityForecast,
)
from engines.market_risk.market_risk_service import (
    GarchConvergenceError,
    compute_correlation,
    compute_diversification,
    compute_drawdown,
    compute_ewma_volatility,
    compute_log_returns,
    compute_portfolio_returns,
    fit_garch_volatility,
    run_backtest,
    score_method,
)

from api.schemas.market_models import TickerListResponse
from api.ticker_registry import TICKER_REGISTRY

router = APIRouter(prefix="/api/market-risk", tags=["market-risk"])


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
    fetch_end = date.today()

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
        backtest_scores[method] = {**scored, "breach_dates": breach_dates}

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
        return cached[1]
    bundle = _compute_bundle(req, session)
    _CACHE[cache_key] = (time.time(), bundle)
    return bundle


@router.post("/analyze", response_model=MarketRiskAnalyzeResponse)
def analyze_market_risk(
    req: MarketRiskAnalyzeRequest, session: Session = Depends(get_session)
) -> MarketRiskAnalyzeResponse:
    bundle = _get_bundle(req, session)
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

    return MarketRiskAnalyzeResponse(
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
