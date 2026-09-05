from fastapi import APIRouter
from engines.liquidity_risk.liquidity_engine import calculate_lcr
from api.schemas.liquidity_models import LCRCalculationRequest, LCRResult

router = APIRouter(prefix="/api/liquidity-risk", tags=["liquidity-risk"])


@router.post("/analyze", response_model=LCRResult)
def calculate(request: LCRCalculationRequest) -> LCRResult:
    return calculate_lcr(
        hqla_items=request.hqla_items,
        retail_deposits=request.retail_deposits,
        wholesale_deposits=request.wholesale_deposits,
        off_balance_sheet=request.off_balance_sheet,
        inflow_items=request.inflow_items,
    )
