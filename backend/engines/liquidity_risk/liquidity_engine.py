import json
import sys
from pathlib import Path

if __package__ is None:
    sys.path.insert(0, str(Path(__file__).parent.parent.parent))
    from engines.liquidity_risk.models import RATING_EXEMPT_ISSUER_TYPES, HQLAItem
else:
    from .models import RATING_EXEMPT_ISSUER_TYPES, HQLAItem

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


def apply_haircuts(hqla_items) -> dict[str, float]:
    """
    Apply the haircut to the HQLA items based on their levels.
    """
    l1_total = 0.0
    l2a_total = 0.0
    l2b_total = 0.0

    for hqla_item in hqla_items:
        level = classify_hqla_levels(hqla_item.issuer_type, hqla_item.rating_band)[
            "level"
        ]

        haircut = haircuts.get(level, 0.0)
        if level == "L1":
            l1_total += hqla_item.amount * (1 - haircut)
        elif level == "L2A":
            l2a_total += hqla_item.amount * (1 - haircut)
        elif level == "L2B":
            l2b_total += hqla_item.amount * (1 - haircut)

    return {"L1": l1_total, "L2A": l2a_total, "L2B": l2b_total}


def apply_hqla_cap(raw_l1: float, raw_l2a: float, raw_l2b: float) -> dict[str, float]:
    """
    Apply the L2 cap to the HQLA items based on their levels.
    """
    # set the LL2B cap to 15% of the total HQLA (L1 + L2A)
    l2b_cap = (15 / 85) * (raw_l1 + raw_l2a)
    l2b_after_step1 = min(raw_l2b, l2b_cap)

    # set the combined l2 actual to the sum of L2A and capped L2B
    combined_l2_actual = raw_l2a + l2b_after_step1
    l2a_total = raw_l2a

    # get the combined L2 cap to 40% of the total HQLA
    combined_l2_cap = (40 / 60) * raw_l1

    # check if the combined L2 actual is greater than the combined L2 cap
    if combined_l2_actual > combined_l2_cap:

        # if YES then set the L2B total to the combined L2 cap minus the raw L2A
        l2b_total = combined_l2_cap - raw_l2a
        if l2b_total < 0:
            l2b_total = 0.0
            l2a_total = combined_l2_cap
    else:

        # if NO then set the L2B total to the minimum of the combined L2 actual and the L2B cap
        l2b_total = l2b_after_step1

    total_hqla = raw_l1 + l2a_total + l2b_total
    return {"L1": raw_l1, "L2A": l2a_total, "L2B": l2b_total, "Total": total_hqla}


print(apply_hqla_cap(1000, 50, 50))
