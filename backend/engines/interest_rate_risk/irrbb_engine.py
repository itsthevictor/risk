"""

Reproduce logica din notebook-ul IRRBB (Interest Rate Risk in the Banking Book):
- regenerare sintetica a datelor de repricing/maturitate per categorie de pozitie
  (datele din mockaroo nu respecta un profil de scadenta coerent)
- calculul NII (Net Interest Income) pe orizont de 12 luni si delta NII sub soc
  paralel de rata
- calculul EVE (Economic Value of Equity) si delta EVE sub cele 6 scenarii de soc
  standard (paralel sus/jos, steepener, flattener, short-end sus/jos)

"""

from __future__ import annotations

import numpy as np
import pandas as pd

RANDOM_SEED = 42  # fixat pentru ca regenerarea sintetica a datelor sa fie reproductibila
AS_OF_DATE = pd.Timestamp("2026-08-19")  # data de referinta a portofoliului mock
NII_HORIZON_DAYS = 365

# Intervale de offset (zile) folosite la regenerarea datelor de repricing per categorie
_CASH_LIKE_OFFSET_DAYS = (0, 31)  # CASH_RESERVES, DEMAND_DEPOSIT
_TERM_DEPOSIT_OFFSET_DAYS = (31, 366)
_GOVT_BOND_OFFSET_DAYS = (365, 365 * 15)
_FIXED_MORTGAGE_OFFSET_DAYS = (365 * 5, 365 * 25)
_ISSUED_BOND_OFFSET_DAYS = (365 * 2, 365 * 10)
_VARIABLE_LOAN_REPRICING_OFFSET_DAYS = (90, 180)
_VARIABLE_LOAN_MATURITY_OFFSET_DAYS = (365 * 3, 365 * 20)


def load_raw_positions(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["repricing_date"] = pd.to_datetime(
        df["repricing_date"], format="%m/%d/%Y", errors="coerce"
    )
    df["maturity_date"] = pd.to_datetime(
        df["maturity_date"], format="%m/%d/%Y", errors="coerce"
    )
    return df


def _regenerate_same_day(
    df: pd.DataFrame,
    mask: pd.Series,
    rng: np.random.Generator,
    low: int,
    high: int,
    as_of: pd.Timestamp,
) -> None:
    """Repricing si maturitate cad in aceeasi zi — cazul pozitiilor cu o singura
    data de refixare (cash, depozite, obligatiuni cu cupon fix pana la scadenta)."""
    n = int(mask.sum())
    offsets = pd.to_timedelta(rng.integers(low, high, size=n), unit="D")
    dates = as_of + offsets
    df.loc[mask, "repricing_date"] = dates
    df.loc[mask, "maturity_date"] = dates


def prepare_irrbb_positions(
    raw_df: pd.DataFrame,
    as_of: pd.Timestamp = AS_OF_DATE,
    seed: int = RANDOM_SEED,
) -> pd.DataFrame:
    """Datele mockaroo au date de repricing/maturitate incoerente (uneori maturitatea
    e in trecut fata de repricing). Le regeneram sintetic per categorie, in jurul lui
    `as_of`, ca sa reflecte un profil de scadenta realist: cash aproape overnight,
    depozite la termen pe termen mediu, obligatiuni guvernamentale si credite variabile
    pe termen lung etc."""
    df = raw_df.copy()
    rng = np.random.default_rng(seed)

    for category in ("CASH_RESERVES", "DEMAND_DEPOSIT"):
        mask = df["category"] == category
        _regenerate_same_day(df, mask, rng, *_CASH_LIKE_OFFSET_DAYS, as_of)

    mask = df["category"] == "TERM_DEPOSIT"
    _regenerate_same_day(df, mask, rng, *_TERM_DEPOSIT_OFFSET_DAYS, as_of)

    mask = df["category"] == "GOVT_BOND"
    _regenerate_same_day(df, mask, rng, *_GOVT_BOND_OFFSET_DAYS, as_of)

    mask = df["category"] == "FIXED_MORTGAGE"
    _regenerate_same_day(df, mask, rng, *_FIXED_MORTGAGE_OFFSET_DAYS, as_of)

    mask = df["category"] == "ISSUED_BOND"
    _regenerate_same_day(df, mask, rng, *_ISSUED_BOND_OFFSET_DAYS, as_of)

    # Creditele variabile se refixeaza curand (3-6 luni), dar maturitatea creditului
    # e mult mai indepartata — cele doua date nu coincid, spre deosebire de restul.
    mask = df["category"] == "VARIABLE_LOAN"
    n = int(mask.sum())
    reprice_offsets = pd.to_timedelta(
        rng.integers(*_VARIABLE_LOAN_REPRICING_OFFSET_DAYS, size=n), unit="D"
    )
    maturity_offsets = pd.to_timedelta(
        rng.integers(*_VARIABLE_LOAN_MATURITY_OFFSET_DAYS, size=n), unit="D"
    )
    repricing_dates = as_of + reprice_offsets
    df.loc[mask, "repricing_date"] = repricing_dates
    df.loc[mask, "maturity_date"] = repricing_dates + maturity_offsets

    return df


def calculate_nii(
    df: pd.DataFrame,
    shock_bp: float,
    as_of: pd.Timestamp = AS_OF_DATE,
    horizon_days: int = NII_HORIZON_DAYS,
) -> dict:
    """Net Interest Income pe orizontul de 12 luni, sub un soc paralel de `shock_bp`
    puncte de baza aplicat de la data de repricing a fiecarei pozitii.

    Pentru fiecare pozitie: daca repricing_date pica dupa finalul orizontului,
    dobanda se calculeaza la rata curenta pe tot orizontul. Altfel, pro-rata: la
    rata curenta pana la repricing, apoi la (rata curenta + soc) de la repricing
    pana la finalul orizontului.
    """
    horizon_end = as_of + pd.Timedelta(days=horizon_days)
    days_before = (df["repricing_date"] - as_of).dt.days.clip(
        lower=0, upper=horizon_days
    )
    days_after = (horizon_end - df["repricing_date"]).dt.days.clip(
        lower=0, upper=horizon_days
    )

    interest = df["principal"] * df["current_rate"] * (days_before / 365) + df[
        "principal"
    ] * (df["current_rate"] + shock_bp / 100) * (days_after / 365)

    total_income = float(interest[df["position_type"] == "ASSET"].sum())
    total_expense = float(interest[df["position_type"] == "LIABILITY"].sum())
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "nii_value": total_income - total_expense,
    }


def compute_nii_scenarios(
    df: pd.DataFrame,
    shock_bp: float = 200.0,
    as_of: pd.Timestamp = AS_OF_DATE,
    horizon_days: int = NII_HORIZON_DAYS,
) -> dict:
    """NII de baza (fara soc) + soc paralel in sus/jos de `shock_bp` puncte de baza,
    si delta NII fata de baza pentru fiecare scenariu."""
    base = calculate_nii(df, 0.0, as_of, horizon_days)
    up = calculate_nii(df, shock_bp, as_of, horizon_days)
    down = calculate_nii(df, -shock_bp, as_of, horizon_days)
    return {
        "as_of_date": as_of.date(),
        "shock_bp": shock_bp,
        "horizon_days": horizon_days,
        "base": base,
        "shock_up": {**up, "delta_nii": up["nii_value"] - base["nii_value"]},
        "shock_down": {**down, "delta_nii": down["nii_value"] - base["nii_value"]},
    }


# ---------------------------------------------------------------------------
# EVE (Economic Value of Equity)
# ---------------------------------------------------------------------------

# Ancore ale curbei de randament (ani -> %), interpolate liniar; in afara domeniului
# se extinde plat (nu se extrapoleaza), ca in notebook.
MATURITY_ANCHORS_YEARS = [0, 0.9, 2.2, 5, 10, 20]
BASE_RATE_ANCHORS_PCT = [3.0, 3.5, 4.0, 4.8, 5.5, 6.0]
FLATTENER_RATE_ANCHORS_PCT = [4.5, 4.5, 4.5, 4.3, 4.15, 4.0]

EVE_SHOCK_TYPES = (
    "base",
    "parallel_up",
    "parallel_down",
    "steepener",
    "flattener",
    "short_up",
    "short_down",
)


def yield_curve(t, shock_type: str = "base"):
    """Randamentul (%) la maturitatea `t` (ani), sub scenariul de soc dat —
    cele 6 scenarii standard IRRBB plus curba de baza."""
    base = np.interp(t, MATURITY_ANCHORS_YEARS, BASE_RATE_ANCHORS_PCT)

    if shock_type == "base":
        shock = 0.0
    elif shock_type == "parallel_up":
        shock = 2.0
    elif shock_type == "parallel_down":
        shock = -2.0
    elif shock_type == "steepener":
        shock = np.interp(t, [0, 20], [-1.0, 1.5])
    elif shock_type == "flattener":
        return np.interp(t, MATURITY_ANCHORS_YEARS, FLATTENER_RATE_ANCHORS_PCT)
    elif shock_type == "short_up":
        shock = 2.5 * np.exp(-np.asarray(t) / 4)
    elif shock_type == "short_down":
        shock = -2.5 * np.exp(-np.asarray(t) / 4)
    else:
        raise ValueError(f"Unknown shock_type: {shock_type}")

    return base + shock


def calculate_eve(
    df: pd.DataFrame,
    as_of: pd.Timestamp = AS_OF_DATE,
    shock_type: str = "base",
) -> dict:
    """Economic Value of Equity: valoarea prezenta a activelor minus valoarea
    prezenta a pasivelor, actualizate pe curba de randament (cu socul aplicat)
    pana la data de maturitate a fiecarei pozitii."""
    t = (df["maturity_date"] - as_of).dt.days / 365
    r = yield_curve(t.to_numpy(), shock_type)
    pv = df["principal"] / (1 + r / 100) ** t

    pv_assets = float(pv[df["position_type"] == "ASSET"].sum())
    pv_liabilities = float(pv[df["position_type"] == "LIABILITY"].sum())
    return {
        "pv_assets": pv_assets,
        "pv_liabilities": pv_liabilities,
        "eve_value": pv_assets - pv_liabilities,
    }


def compute_eve_scenarios(df: pd.DataFrame, as_of: pd.Timestamp = AS_OF_DATE) -> dict:
    """EVE de baza + toate cele 6 socuri standard IRRBB (paralel, steepener/
    flattener, short-end), plus delta EVE fata de baza pentru fiecare scenariu."""
    results = {
        shock_type: calculate_eve(df, as_of, shock_type)
        for shock_type in EVE_SHOCK_TYPES
    }
    base_eve = results["base"]["eve_value"]
    scenarios = {
        shock_type: {**result, "delta_eve": result["eve_value"] - base_eve}
        for shock_type, result in results.items()
    }
    return {"as_of_date": as_of.date(), "scenarios": scenarios}
