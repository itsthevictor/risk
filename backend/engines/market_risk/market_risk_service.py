"""

Reproduce logica din VAR.ipynb (ciornele din repo /itsthevictor/rm)
- portofoliu cu randamente logaritmice, simulări Monte Carlo, volatilitate EWMA și GARCH
- backtesting Kupiec și Christoffersen cu lumini de semafor
- max drawdown, diversification benefit, correlation matrix

"""

from __future__ import annotations

import numpy as np
import pandas as pd
from arch import arch_model
from scipy.stats import binom, chi2, norm

RANDOM_SEED = (
    42  # fixed so re-running the same portfolio doesn't change MC VaR on every request
)
MC_SIMS = 10_000
EWMA_LAMBDA = 0.94
TRAFFIC_LIGHT_WINDOW = 250


# ---------------------------------------------------------------------------
# Returns / portfolio construction
# ---------------------------------------------------------------------------


def compute_log_returns(adj_close: pd.DataFrame) -> pd.DataFrame:
    """adj_close: indexat pe data, o coloana pentru fiecare ticker."""
    return np.log(adj_close / adj_close.shift(1)).dropna(how="all")


def compute_portfolio_returns(
    log_returns: pd.DataFrame, weights: np.ndarray
) -> pd.Series:
    """Portofoliu cu randamente logaritmice, ponderi egale per ticker"""
    return (log_returns * weights).sum(axis=1)


# ---------------------------------------------------------------------------
# Volatility models — each fit ONCE on the full series, then indexed per day
# in the backtest loop (this is what the notebook actually does for EWMA/GARCH,
# even though it re-derives Historical/Monte Carlo per rolling window).
# ---------------------------------------------------------------------------


def compute_ewma_volatility(
    returns: pd.Series, lam: float = EWMA_LAMBDA, seed_window: int = 252
) -> pd.Series:
    n = len(returns)
    returns_sq = returns.values**2
    ewma_var = np.full(n, np.nan)
    ewma_var[seed_window - 1] = returns.iloc[:seed_window].std() ** 2
    alpha = 1 - lam
    for t in range(seed_window, n):
        ewma_var[t] = lam * ewma_var[t - 1] + alpha * returns_sq[t - 1]
    return pd.Series(np.sqrt(ewma_var), index=returns.index)


def fit_garch_volatility(returns: pd.Series) -> pd.Series:
    """Returneaza volatilitatea conditionala GARCH(1,1), decimal (nu %)"""

    returns_pct = (
        returns * 100
    )  # arch_model wants percentage points for numerical stability
    model = arch_model(returns_pct, vol="Garch", p=1, q=1, dist="normal", mean="Zero")
    result = model.fit(disp="off")
    if not result.convergence_flag == 0:
        raise GarchConvergenceError("GARCH(1,1) did not converge for this ticker set")
    return result.conditional_volatility / 100


class GarchConvergenceError(RuntimeError):
    pass


# ---------------------------------------------------------------------------
# Backtest — se calculeaza intr-o singura transa fiecare metoda pentru fiecare nivel de incredere
# ---------------------------------------------------------------------------


def run_backtest(
    returns: pd.Series,
    portfolio_value: float,
    estimation_window_days: int,
    confidence_levels: list[float],
    ewma_vol: pd.Series,
    garch_vol: pd.Series,
    mc_sims: int = MC_SIMS,
    seed: int = RANDOM_SEED,
) -> dict:

    rng = np.random.default_rng(seed)
    n = len(returns)
    # ewma_vol/garch_vol are only defined from their own warm-up point onward
    # (e.g. EWMA needs `seed_window` days before its first estimate) — that can
    # be later than `estimation_window_days` when a short window is requested,
    # so the backtest must never start before both models have real values.
    ewma_first_valid = ewma_vol.index.get_loc(ewma_vol.first_valid_index())
    garch_first_valid = garch_vol.index.get_loc(garch_vol.first_valid_index())
    start = max(estimation_window_days, ewma_first_valid, garch_first_valid)
    dates = returns.index[start:]
    actual_pnl = (returns.iloc[start:] * portfolio_value).to_numpy()

    series = {
        cf: {
            m: {"var": [], "es": []}
            for m in ("historical", "parametric", "ewma", "garch", "monte_carlo")
        }
        for cf in confidence_levels
    }

    for t in range(start, n):
        window = returns.iloc[t - estimation_window_days : t]
        window_dollar = window.to_numpy() * portfolio_value
        mu, sigma = window.mean(), window.std()
        ewma_vol_t = ewma_vol.iloc[t]
        garch_vol_t = garch_vol.iloc[t]

        # Monte Carlo: one vectorized draw per day, reused across confidence levels
        z = rng.standard_normal(mc_sims)
        sim_pnl = portfolio_value * (mu + z * sigma)

        for cf in confidence_levels:
            tail_pct = 100 - cf * 100
            z_cf = norm.ppf(cf)
            es_multiplier = norm.pdf(z_cf) / (1 - cf)

            # Historical
            h_var = -np.percentile(window_dollar, tail_pct)
            h_es = (
                -window_dollar[window_dollar <= -h_var].mean()
                if (window_dollar <= -h_var).any()
                else h_var
            )
            series[cf]["historical"]["var"].append(h_var)
            series[cf]["historical"]["es"].append(h_es)

            # Parametric (plain sample std)
            p_var = portfolio_value * sigma * z_cf
            p_es = portfolio_value * sigma * es_multiplier
            series[cf]["parametric"]["var"].append(p_var)
            series[cf]["parametric"]["es"].append(p_es)

            # EWMA
            series[cf]["ewma"]["var"].append(portfolio_value * ewma_vol_t * z_cf)
            series[cf]["ewma"]["es"].append(
                portfolio_value * ewma_vol_t * es_multiplier
            )

            # GARCH
            series[cf]["garch"]["var"].append(portfolio_value * garch_vol_t * z_cf)
            series[cf]["garch"]["es"].append(
                portfolio_value * garch_vol_t * es_multiplier
            )

            # Monte Carlo
            mc_var = -np.percentile(sim_pnl, tail_pct)
            below = sim_pnl[sim_pnl <= -mc_var]
            mc_es = -below.mean() if below.size else mc_var
            series[cf]["monte_carlo"]["var"].append(mc_var)
            series[cf]["monte_carlo"]["es"].append(mc_es)

    return {"dates": dates, "actual_pnl": actual_pnl, "by_confidence": series}


# ---------------------------------------------------------------------------
# Backtest scoring — Kupiec, Christoffersen, semafor
# ---------------------------------------------------------------------------


def _log_likelihood(pi: float, n0: int, n1: int) -> float:
    pi = min(max(pi, 1e-10), 1 - 1e-10)  # guard log(0)
    return n0 * np.log(1 - pi) + n1 * np.log(pi)


def kupiec_test(n: int, hits: int, p: float) -> tuple[float, float]:
    pi_hat = hits / n
    lr_uc = -2 * (
        _log_likelihood(p, n - hits, hits) - _log_likelihood(pi_hat, n - hits, hits)
    )
    p_value = 1 - chi2.cdf(lr_uc, df=1)
    return lr_uc, p_value


def christoffersen_test(hit_series: np.ndarray) -> tuple[float, float]:
    prev, curr = hit_series[:-1], hit_series[1:]
    n00 = np.sum((prev == 0) & (curr == 0))
    n01 = np.sum((prev == 0) & (curr == 1))
    n10 = np.sum((prev == 1) & (curr == 0))
    n11 = np.sum((prev == 1) & (curr == 1))
    n0, n1 = n00 + n10, n01 + n11
    pi_01 = n01 / (n00 + n01) if (n00 + n01) > 0 else 0.0
    pi_11 = n11 / (n10 + n11) if (n10 + n11) > 0 else 0.0
    pi_overall = n1 / (n0 + n1) if (n0 + n1) > 0 else 0.0

    restricted = _log_likelihood(pi_overall, n0, n1)
    unrestricted = _log_likelihood(pi_01, n00, n01) + _log_likelihood(pi_11, n10, n11)
    lr_ind = -2 * (restricted - unrestricted)
    p_value = 1 - chi2.cdf(lr_ind, df=1)
    return lr_ind, p_value


def traffic_light_status(
    hit_series: np.ndarray, confidence: float, window: int = TRAFFIC_LIGHT_WINDOW
) -> str:
    """Semafor stil Basel pe baza ultimei ferestre de zile, generalizat la orice nivel
    de incredere: pragurile oficiale Basel (verde 0-4, galben 5-9 din 250 zile la 99%)
    corespund cutoff-urilor de 95% si 99.99% din functia de repartitie binomiala pentru
    numarul de depasiri asteptat. La 99% incredere formula de mai jos reproduce exact
    pragurile 4/9; la orice alt nivel (ex. 95%, unde se asteapta ~12.5 depasiri din 250,
    nu ~2.5), pragurile se scaleaza corespunzator in loc sa ramana fixate la 4/9."""
    if len(hit_series) < window:
        window = len(hit_series)
    recent_hits = hit_series[-window:].sum()
    p = 1 - confidence
    green_upper = binom.ppf(0.95, window, p) - 1
    yellow_upper = binom.ppf(0.9999, window, p) - 1
    if recent_hits <= green_upper:
        return "green"
    elif recent_hits <= yellow_upper:
        return "yellow"
    return "red"


def score_method(
    actual_pnl: np.ndarray, var_series: np.ndarray, confidence: float
) -> dict:
    hit_series = (actual_pnl < -var_series).astype(int)
    n, hits = len(hit_series), int(hit_series.sum())
    p = 1 - confidence

    kupiec_lr, kupiec_p = kupiec_test(n, hits, p)
    christoffersen_lr, christoffersen_p = christoffersen_test(hit_series)
    cc_lr = kupiec_lr + christoffersen_lr
    cc_p = 1 - chi2.cdf(cc_lr, df=2)
    traffic_light = traffic_light_status(hit_series, confidence)

    return {
        "hits": hits,
        "total_observations": n,
        "kupiec_lr": kupiec_lr,
        "kupiec_p_value": kupiec_p,
        "christoffersen_lr": christoffersen_lr,
        "christoffersen_p_value": christoffersen_p,
        "conditional_coverage_lr": cc_lr,
        "conditional_coverage_p_value": cc_p,
        "traffic_light": traffic_light,
        "hit_mask": hit_series,  # caller slices this into breach_dates; not sent to the client
    }


# ---------------------------------------------------------------------------
# Drawdown / diversification / correlation
# ---------------------------------------------------------------------------


def compute_drawdown(returns: pd.Series, portfolio_value: float) -> dict:
    v_t = portfolio_value * np.exp(returns.cumsum())
    drawdown = v_t / v_t.cummax() - 1
    return {
        "dates": returns.index,
        "values": drawdown.to_numpy(),
        "max_drawdown": float(drawdown.min()),
    }


def compute_diversification(
    log_returns: pd.DataFrame,
    weights: np.ndarray,
    portfolio_value: float,
    confidence: float,
) -> dict:
    """Calculeaza beneficiul de diversificare al portofoliului pe baza VaR-ului parametric normal."""
    z_cf = norm.ppf(confidence)
    per_asset_value = weights * portfolio_value
    standalone_vars = {
        ticker: float(per_asset_value[i] * log_returns[ticker].std() * z_cf)
        for i, ticker in enumerate(log_returns.columns)
    }
    portfolio_returns = compute_portfolio_returns(log_returns, weights)
    portfolio_var = float(portfolio_value * portfolio_returns.std() * z_cf)
    benefit = sum(standalone_vars.values()) - portfolio_var
    return {
        "standalone_vars": standalone_vars,
        "portfolio_var": portfolio_var,
        "diversification_benefit": benefit,
        "diversification_benefit_pct": benefit / portfolio_value,
    }


def compute_correlation(log_returns: pd.DataFrame) -> dict:
    corr = log_returns.corr()
    return {"tickers": list(corr.columns), "matrix": corr.to_numpy().tolist()}


# ---------------------------------------------------------------------------
# Stress testing — replay real historical returns, or a hypothetical per-asset-class
# shock, onto TODAY's portfolio value. Unlike the backtest above, this deliberately
# does not touch the rolling VaR/backtest machinery: it answers "what would happen to
# my portfolio right now if this scenario played out", not "how did my model do".
# ---------------------------------------------------------------------------


def historical_scenario_pnl(
    returns: pd.Series, start: str, end: str, portfolio_value: float
) -> dict:
    """Replays the actual cumulative log-return realised between start and end onto
    portfolio_value, e.g. 'what if my current portfolio had lived through COVID.'"""
    window_returns = returns.loc[start:end]
    if window_returns.empty:
        raise ValueError(f"No trading days between {start} and {end}")
    total_return_factor = float(np.exp(window_returns.sum()))
    ending_value = portfolio_value * total_return_factor
    pnl = ending_value - portfolio_value
    return {
        "total_return_factor": total_return_factor,
        "ending_value": ending_value,
        "pnl": pnl,
        "pnl_pct": pnl / portfolio_value,
    }


def hypothetical_scenario_pnl(
    weights: np.ndarray,
    asset_classes: list[str],
    shocks: dict[str, float],
    portfolio_value: float,
) -> dict:
    """Applies a per-asset-class shock (e.g. {'equity': -0.30}) weighted by how much
    of the portfolio sits in each class. A class present in the portfolio but absent
    from `shocks` is treated as unshocked (0%)."""
    weighted_return = sum(
        shocks.get(cls, 0.0) * w for cls, w in zip(asset_classes, weights)
    )
    total_return_factor = 1 + weighted_return
    ending_value = portfolio_value * total_return_factor
    pnl = ending_value - portfolio_value
    return {
        "total_return_factor": total_return_factor,
        "ending_value": ending_value,
        "pnl": pnl,
        "pnl_pct": pnl / portfolio_value,
    }


def categorize_stress_result(
    pnl_pct: float, warning_pct: float = 0.15, critical_pct: float = 0.20
) -> str:
    """Basel-style breach categorisation: how far the scenario loss sits past the
    warning/critical thresholds set for this book."""
    loss_pct = -pnl_pct
    if loss_pct >= critical_pct:
        return "critical"
    if loss_pct >= warning_pct:
        return "warning"
    return "ok"
