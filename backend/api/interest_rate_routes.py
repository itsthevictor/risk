from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Query

from api.schemas.interest_rate_models import (
    EveAnalysisResponse,
    EveScenarios,
    NIIAnalysisResponse,
)
from engines.interest_rate_risk.irrbb_engine import (
    compute_eve_scenarios,
    compute_nii_scenarios,
    load_raw_positions,
    prepare_irrbb_positions,
)

router = APIRouter(prefix="/api/interest-rate-risk", tags=["interest-rate-risk"])

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "irrbb_mock_data.csv"

# Position-level repricing/maturity dates are regenerated deterministically (fixed
# seed) from the static mock CSV, so the prepared book only needs to be built once
# per process rather than on every request.
_PREPARED_POSITIONS = None


def _get_prepared_positions():
    global _PREPARED_POSITIONS
    if _PREPARED_POSITIONS is None:
        raw = load_raw_positions(str(_DATA_PATH))
        _PREPARED_POSITIONS = prepare_irrbb_positions(raw)
    return _PREPARED_POSITIONS


@router.get("/nii-analysis", response_model=NIIAnalysisResponse)
def nii_analysis(
    shock_bp: float = Query(
        default=200.0,
        gt=0,
        le=500,
        description="Marimea socului paralel de rata (bps), aplicat atat in sus cat si in jos fata de rata curenta",
    ),
) -> NIIAnalysisResponse:
    positions = _get_prepared_positions()
    result = compute_nii_scenarios(positions, shock_bp=shock_bp)
    return NIIAnalysisResponse(**result)


@router.get("/eve-analysis", response_model=EveAnalysisResponse)
def eve_analysis() -> EveAnalysisResponse:
    positions = _get_prepared_positions()
    result = compute_eve_scenarios(positions)
    return EveAnalysisResponse(
        as_of_date=result["as_of_date"],
        scenarios=EveScenarios(**result["scenarios"]),
    )
