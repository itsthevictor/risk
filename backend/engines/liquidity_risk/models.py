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
