import json
from pathlib import Path
from .models import RATING_EXEMPT_ISSUER_TYPES

CONFIG_PATH = Path(__file__).parent / "config" / "lcr_params.json"


with open(CONFIG_PATH) as f:
    lcr_params = json.load(f)

hqla_classification = lcr_params[
    "hqla_classification"
]  # this is the list you loop over
haircuts = lcr_params["haircuts"]  # this is the level→% lookup

# def calculate_lcr(assets, outflows, inflows, params):
#     # 1. HQLA
#     hqla_raw = apply_haircuts(assets, params)  # L1/L2A/L2B after haircut
#     hqla = apply_l2_caps(hqla_raw)  # 40% L2 cap, 15% L2B cap

#     # 2. Outflows
#     total_outflows = sum(apply_runoff_rates(outflows, params))

#     # 3. Inflows (capped at 75% of outflows)
#     total_inflows = min(sum(apply_inflow_rates(inflows, params)), 0.75 * total_outflows)

#     net_outflows = total_outflows - total_inflows

#     lcr = hqla / net_outflows * 100
#     return {
#         "hqla": hqla,
#         "outflows": total_outflows,
#         "inflows": total_inflows,
#         "net_outflows": net_outflows,
#         "lcr_pct": lcr,
#     }


def classify_hqla_levels(issuer_type: str, rating_band: str | None) -> dict[str, str]:
    """
    1. look through the lcr_params to find the matching issuer_type and rating_band
    2. if the issuer type doesn require a rating - return the level directly, ignoring rating_band
    3. Otherwise, find the row that matches both issuer_type and rating-band and return the level
    4. decide what happens if no match is found at all - return None or raise an error
    """

    if issuer_type in RATING_EXEMPT_ISSUER_TYPES:
            for hqla in hqla_classification:
                if hqla["issuer_type"] == issuer_type:
                    return {"level": hqla["hqla_level"]}
    else:
        for hqla in hqla_classification:
            if (
                hqla["issuer_type"] == issuer_type
                and hqla.get("rating_band") == rating_band
            ):
                return {"level": hqla["hqla_level"]}

    raise ValueError(
        f"No matching HQLA level found for issuer_type: {issuer_type}, rating_band: {rating_band}"
    )
