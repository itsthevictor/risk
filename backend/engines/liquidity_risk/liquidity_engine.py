import json
import sys
from pathlib import Path

if __package__ is None:
    sys.path.insert(0, str(Path(__file__).parent.parent.parent))
    from api.schemas.liquidity_models import (
        RATING_EXEMPT_ISSUER_TYPES,
        HQLAItem,
        LCRResult,
    )
else:
    from api.schemas.liquidity_models import (
        RATING_EXEMPT_ISSUER_TYPES,
        HQLAItem,
        LCRResult,
    )

CONFIG_PATH = Path(__file__).parent / "config" / "lcr_params.json"


with open(CONFIG_PATH) as f:
    lcr_params = json.load(f)

hqla_classification = lcr_params["hqla_classification"]  # this is the list to loop over
haircuts = lcr_params["haircuts"]  # this is the level→% lookup
runoff_rates = lcr_params["runoff_rates"]  # this is the category→% lookup
inflow_rates = lcr_params["inflow_rates"]  # this is the category→% lookup


def calculate_lcr(
    hqla_items: list[HQLAItem],
    retail_deposits: list[dict],
    wholesale_deposits: list[dict],
    off_balance_sheet: list[dict],
    inflow_items: list[dict],
) -> dict:
    # 1. HQLA

    haircut_hqla = apply_haircuts(hqla_items)  # L1/L2A/L2B after haircut

    hqla = apply_l2_caps(
        haircut_hqla["L1"], haircut_hqla["L2A"], haircut_hqla["L2B"]
    )  # 40% L2 cap, 15% L2B cap

    # 2. Outflows
    retail_result = apply_runoff_rates(retail_deposits, runoff_rates)
    wholesale_result = apply_runoff_rates(wholesale_deposits, runoff_rates)
    obs_result = apply_runoff_rates(off_balance_sheet, runoff_rates)

    total_outflows = (
        retail_result["total"] + wholesale_result["total"] + obs_result["total"]
    )

    # 3. Inflows (capped at 75% of outflows)
    inflow_result = apply_inflow_rates(inflow_items, inflow_rates, total_outflows)
    total_inflows_capped = inflow_result["total_inflows_capped"]

    net_outflows = total_outflows - total_inflows_capped

    lcr = hqla["Total"] / net_outflows * 100

    return LCRResult(
        hqla_l1=hqla["L1"],
        hqla_l2a=hqla["L2A"],
        hqla_l2b=hqla["L2B"],
        hqla_total=hqla["Total"],
        total_outflows=total_outflows,
        outflow_breakdown={
            **retail_result["breakdown"],
            **wholesale_result["breakdown"],
            **obs_result["breakdown"],
        },
        total_inflows_uncapped=inflow_result["total_inflows_uncapped"],
        total_inflows_capped=total_inflows_capped,
        inflow_breakdown=inflow_result["breakdown"],
        net_outflows=net_outflows,
        lcr_ratio=lcr,
    )


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


def apply_l2_caps(raw_l1: float, raw_l2a: float, raw_l2b: float) -> dict[str, float]:
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


def apply_runoff_rates(items, runoff_rates) -> dict[str, float]:
    """

    1. Start an empty dict for the breakdown, and a running total at zero
    2. Loop through each item
    3. Look up the run-off rate for item.category in runoff_rates
    4. Multiply item.amount x rate
    5. Add that to the breakdown dict (keyed by category — if the category already has a value from a previous item, add to it, don't overwrite)
    6. Add it to the running total
    7. Return both the breakdown dict and the total

    """
    breakdown = {}
    total = 0.0
    for item in items:
        rate = runoff_rates.get(item.category, 0.0)
        amount_after_runoff = item.amount * rate
        breakdown[item.category] = (
            breakdown.get(item.category, 0.0) + amount_after_runoff
        )
        total += amount_after_runoff

    return {"breakdown": breakdown, "total": total}


def apply_inflow_rates(items, inflow_rates, total_outflows) -> dict[str, float]:
    """
    1. Same loop pattern as apply_runoff_rates() — build a breakdown dict and a raw total, exactly the same way
    2. New step: after the loop, compute capped_total = min(raw_total, 0.75 * total_outflows)
    3. Return breakdown, raw total, and capped total — all three, since your LCRResult needs total_inflows_uncapped and total_inflows_capped as separate fields

    """

    breakdown = {}
    total_inflows_uncapped = 0.0
    for item in items:
        rate = inflow_rates.get(item.category, 0.0)
        amount_after_inflow = item.amount * rate
        breakdown[item.category] = (
            breakdown.get(item.category, 0.0) + amount_after_inflow
        )
        total_inflows_uncapped = total_inflows_uncapped + amount_after_inflow

    capped_total = min(total_inflows_uncapped, 0.75 * total_outflows)
    return {
        "breakdown": breakdown,
        "total_inflows_uncapped": total_inflows_uncapped,
        "total_inflows_capped": capped_total,
    }
