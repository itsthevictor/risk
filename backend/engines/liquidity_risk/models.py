from pydantic import BaseModel, Field, model_validator
from typing import Literal, Optional

IssuerType = Literal[
    "sovereign_own_country",
    "central_bank_cash",
    "sovereign_foreign",
    "multilateral_dev_bank",
    "covered_bond",
    "corporate_bond",
    "equity_index_listed",
    "equity_other",
    "rmbs",
    "other",
]

RatingBand = Literal[
    "AAA_AA",
    "A",
    "BBB",
    "below_BBB_minus",
    "not_rated",
]

# issuer types where a rating is NOT required to classify the item
RATING_EXEMPT_ISSUER_TYPES = {"sovereign_own_country", "central_bank_cash"}


class HQLAItem(BaseModel):
    description: str
    amount: float = Field(gt=0)
    issuer_type: IssuerType
    rating_band: Optional[RatingBand] = None

    @model_validator(mode="after")
    def check_rating_required(self) -> "HQLAItem":
        if (
            self.issuer_type not in RATING_EXEMPT_ISSUER_TYPES
            and self.rating_band is None
        ):
            raise ValueError(
                f"rating_band is required for issuer_type '{self.issuer_type}'"
            )
        return self


RetailDepositCategory = Literal[
    "stable_retail",
    "less_stable_retail",
    "sme",
]


class RetailDepositItem(BaseModel):
    description: str
    amount: float = Field(gt=0)
    category: RetailDepositCategory


WholesaleDepositCategory = Literal[
    "operational_deposit",
    "non_operational_corporate",
    "non_operational_financial_institution",
]


class WholesaleDepositItem(BaseModel):
    description: str
    amount: float = Field(gt=0)
    category: WholesaleDepositCategory


OffBalanceSheetCategory = Literal[
    "retail_sme_facility",
    "corporate_facility",
    "bank_fi_facility",
]


class OffBalanceSheetItem(BaseModel):
    description: str
    amount: float = Field(gt=0)
    category: OffBalanceSheetCategory


InflowItemCategory = Literal[
    "secured_lending_l1_collateral",
    "secured_lending_l2a_collateral",
    "retail_sme_loan_repayment",
    "corporate_loan_repayment",
    "bank_fi_loan_repayment",
]


class InflowItem(BaseModel):
    description: str
    amount: float = Field(gt=0)
    category: InflowItemCategory


class LCRResult(BaseModel):
    hqla_l1: float
    hqla_l2a: float
    hqla_l2b: float
    hqla_total: float
    total_outflows: float
    outflow_breakdown: dict[str, float]
    total_inflows_uncapped: float
    total_inflows_capped: float
    inflow_breakdown: dict[str, float]
    net_outflows: float
    lcr_ratio: float


class LCRCalculationRequest(BaseModel):
    hqla_items: list[HQLAItem]
    retail_deposits: list[RetailDepositItem]
    wholesale_deposits: list[WholesaleDepositItem]
    off_balance_sheet: list[OffBalanceSheetItem]
    inflow_items: list[InflowItem]
