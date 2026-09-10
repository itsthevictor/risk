from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Query

from api.schemas.interest_rate_models import (
    EveAnalysisResponse,
    EveScenarios,
    NIIAnalysisResponse,
    Position,
    PositionsResponse,
)
from engines.interest_rate_risk.irrbb_engine import (
    compute_eve_scenarios,
    compute_nii_scenarios,
    load_prepared_positions,
)

router = APIRouter(prefix="/api/interest-rate-risk", tags=["interest-rate-risk"])

_DATA_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "irrbb_data_prepared.csv"
)

# Pozitiile pregatite (repricing/maturity deja regenerate) se citesc o singura
# data per proces, nu la fiecare request.
_PREPARED_POSITIONS = None


def _get_prepared_positions():
    global _PREPARED_POSITIONS
    if _PREPARED_POSITIONS is None:
        _PREPARED_POSITIONS = load_prepared_positions(str(_DATA_PATH))
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


@router.get("/positions", response_model=PositionsResponse)
def positions() -> PositionsResponse:
    """Setul de date (deja pregatit) folosit pentru calculele NII si EVE de mai
    sus, expus ca atare pentru afisare in UI."""
    df = _get_prepared_positions()
    rows = [
        Position(
            position_id=int(row.position_id),
            position_type=row.position_type,
            category=row.category,
            principal=float(row.principal),
            current_rate=float(row.current_rate),
            repricing_date=row.repricing_date.date(),
            maturity_date=row.maturity_date.date(),
        )
        for row in df.itertuples(index=False)
    ]
    return PositionsResponse(positions=rows)
