"""

Pydantic response models for the Interest Rate Risk API
(`GET /api/interest-rate-risk/nii-analysis`, `GET /api/interest-rate-risk/eve-analysis`).

"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field


class NIIComponents(BaseModel):
    total_income: float
    total_expense: float
    nii_value: float


class NIIShockResult(NIIComponents):
    delta_nii: float = Field(..., description="nii_value - base.nii_value")


class NIIAnalysisResponse(BaseModel):
    as_of_date: date
    shock_bp: float = Field(
        ..., description="Marimea socului paralel de rata, in puncte de baza"
    )
    horizon_days: int
    base: NIIComponents
    shock_up: NIIShockResult
    shock_down: NIIShockResult


class EveScenarioResult(BaseModel):
    pv_assets: float
    pv_liabilities: float
    eve_value: float
    delta_eve: float = Field(
        ..., description="eve_value - scenarios.base.eve_value"
    )


class EveScenarios(BaseModel):
    base: EveScenarioResult
    parallel_up: EveScenarioResult
    parallel_down: EveScenarioResult
    steepener: EveScenarioResult
    flattener: EveScenarioResult
    short_up: EveScenarioResult
    short_down: EveScenarioResult


class EveAnalysisResponse(BaseModel):
    as_of_date: date
    scenarios: EveScenarios


class Position(BaseModel):
    position_id: int
    position_type: str
    category: str
    principal: float
    current_rate: float
    repricing_date: date
    maturity_date: date


class PositionsResponse(BaseModel):
    positions: list[Position]
