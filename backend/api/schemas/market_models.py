"""

Pydantic request/response models for the Market Risk API (`POST /api/market-risk/analyze`
and `GET /api/tickers`).

"""

from datetime import date
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

# ENUMS


class RiskMethod(str, Enum):
    historical = "historical"
    parametric = "parametric"  # plain sample std dev
    ewma = "ewma"  # parametric with EWMA vol
    garch = "garch"  # parametric with GARCH(1,1) vol
    monte_carlo = "monte_carlo"


class CrisisWindowPreset(str, Enum):
    y2020 = "2020"
    y2022 = "2022"
    custom = "custom"


class TrafficLight(str, Enum):
    green = "green"
    yellow = "yellow"
    red = "red"


# REQUEST


class CustomWindow(BaseModel):
    start: date
    end: date

    @model_validator(mode="after")
    def start_before_end(self) -> "CustomWindow":
        if self.start >= self.end:
            raise ValueError("start must be before end")
        return self


class MarketRiskAnalyzeRequest(BaseModel):
    tickers: list[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Equity/FX tickers for the equal-weight portfolio, e.g. ['AAPL', 'MSFT', 'EURUSD=X']",
    )
    portfolio_value: float = Field(default=1_000_000, gt=0)
    crisis_window: Optional[CrisisWindowPreset] = None
    custom_window: Optional[CustomWindow] = Field(
        default=None,
        description="Required when crisis_window == 'custom', ignored otherwise",
    )
    estimation_window_days: int = Field(
        default=252,
        ge=30,
        le=756,
        description="Rolling window (trading days) used for the backtest, e.g. 252 = 1 year",
    )
    confidence_levels: list[float] = Field(
        default=[0.90, 0.95, 0.99],
        description="All returned together so the frontend can toggle confidence with no refetch",
    )

    @field_validator("tickers")
    @classmethod
    def normalize_tickers(cls, v: list[str]) -> list[str]:
        cleaned = [t.strip().upper() for t in v]
        if len(set(cleaned)) != len(cleaned):
            raise ValueError("duplicate tickers in portfolio")
        return cleaned

    @field_validator("confidence_levels")
    @classmethod
    def validate_confidence_levels(cls, v: list[float]) -> list[float]:
        if not v:
            raise ValueError("at least one confidence level is required")
        for cl in v:
            if not (0.5 < cl < 1.0):
                raise ValueError(f"confidence level {cl} must be between 0.5 and 1.0")
        return sorted(v)

    @model_validator(mode="after")
    def custom_window_required(self) -> "MarketRiskAnalyzeRequest":
        if (
            self.crisis_window == CrisisWindowPreset.custom
            and self.custom_window is None
        ):
            raise ValueError("custom_window is required when crisis_window == 'custom'")
        return self


# RESPONSE


class VarEsPair(BaseModel):
    var: float = Field(..., description="Dollar VaR (positive number = loss)")
    es: float = Field(
        ..., description="Dollar Expected Shortfall (positive number = loss)"
    )
    var_pct: float = Field(..., description="VaR as a fraction of portfolio_value")
    es_pct: float = Field(..., description="ES as a fraction of portfolio_value")


class MethodResults(BaseModel):
    historical: VarEsPair
    parametric: VarEsPair
    ewma: VarEsPair
    garch: VarEsPair
    monte_carlo: VarEsPair


class ConfidenceLevelResult(BaseModel):
    confidence_level: float
    methods: MethodResults


class TimeSeries(BaseModel):
    dates: list[date]
    values: list[float]

    @model_validator(mode="after")
    def same_length(self) -> "TimeSeries":
        if len(self.dates) != len(self.values):
            raise ValueError("dates and values must be the same length")
        return self


class VolatilityForecast(BaseModel):
    dates: list[date]
    ewma: list[float] = Field(..., description="Daily EWMA volatility")
    garch: list[float] = Field(
        ..., description="Daily GARCH(1,1) conditional volatility"
    )


class BacktestStats(BaseModel):
    hits: int = Field(
        ..., description="Count of actual losses exceeding VaR over the sample"
    )
    total_observations: int
    kupiec_lr: float
    kupiec_p_value: float
    christoffersen_lr: float
    christoffersen_p_value: float
    conditional_coverage_lr: float
    conditional_coverage_p_value: float
    traffic_light: TrafficLight
    breach_dates: list[date] = Field(
        ..., description="Dates where actual P&L breached this method's VaR"
    )


class MethodBacktest(BaseModel):
    historical: BacktestStats
    parametric: BacktestStats
    ewma: BacktestStats
    garch: BacktestStats
    monte_carlo: BacktestStats


class DrawdownResult(BaseModel):
    dates: list[date]
    values: list[float] = Field(
        ..., description="Drawdown series, e.g. -0.12 = -12% from peak"
    )
    max_drawdown: float


class DiversificationResult(BaseModel):
    standalone_vars: dict[str, float] = Field(
        ...,
        description="Per-ticker VaR as if held alone, dollar terms, at the primary confidence level",
    )
    portfolio_var: float
    diversification_benefit: float = Field(
        ..., description="sum(standalone_vars) - portfolio_var, dollar terms"
    )
    diversification_benefit_pct: float


class CorrelationMatrix(BaseModel):
    tickers: list[str]
    matrix: list[list[float]] = Field(
        ..., description="Pairwise correlation, same order as `tickers`"
    )

    @model_validator(mode="after")
    def square_matrix(self) -> "CorrelationMatrix":
        n = len(self.tickers)
        if len(self.matrix) != n or any(len(row) != n for row in self.matrix):
            raise ValueError("matrix must be square and match len(tickers)")
        return self


class PortfolioSummary(BaseModel):
    tickers: list[str]
    weights: list[float]
    value: float
    start_date: date
    end_date: date


# Response — top level


class MarketRiskAnalyzeResponse(BaseModel):
    portfolio: PortfolioSummary
    var_comparison: list[ConfidenceLevelResult]
    actual_pnl: TimeSeries
    volatility_forecast: VolatilityForecast
    backtest: MethodBacktest
    drawdown: DrawdownResult
    diversification: DiversificationResult
    correlation_matrix: CorrelationMatrix


# Tickers endpoint (GET /api/tickers)


class TickerInfo(BaseModel):
    symbol: str
    name: str
    asset_class: Literal["equity", "fx"]


class TickerListResponse(BaseModel):
    tickers: list[TickerInfo]


# Errors


class ErrorCode(str, Enum):
    ticker_not_found = "ticker_not_found"
    insufficient_history = "insufficient_history"
    garch_did_not_converge = "garch_did_not_converge"
    validation_error = "validation_error"


class ErrorResponse(BaseModel):
    code: ErrorCode
    message: str
    details: Optional[dict] = Field(
        None, description="Optional additional details about the error"
    )
