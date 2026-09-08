"""
Regression test for the crisis_window / fetch-window bug in market_routes.py.

Before the fix, `crisis_window` changed `fetch_start`/`fetch_end` (and even raised
NameError), so requests with a crisis window returned "today's" VaR from the end of
the crisis period instead of from today, and the backtest ran on a tiny sample.

This test never hits Postgres or yfinance: `get_adj_close` is monkeypatched to serve
slices of an in-memory synthetic price history, and the crisis-window fetch invariant
is checked directly against the recorded calls.
"""

from __future__ import annotations

from datetime import date, timedelta

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from api import market_routes
from db.session import get_session
from main import app

TICKERS = ["AAA", "BBB"]


def _build_synthetic_history(years: int = 9) -> pd.DataFrame:
    end = date.today()
    start = end - timedelta(days=years * 365)
    idx = pd.bdate_range(start=start, end=end)
    rng = np.random.default_rng(7)
    data = {}
    for ticker in TICKERS:
        log_returns = rng.normal(loc=0.0002, scale=0.01, size=len(idx))
        data[ticker] = 100 * np.exp(np.cumsum(log_returns))
    return pd.DataFrame(data, index=idx)


FULL_HISTORY = _build_synthetic_history()


@pytest.fixture
def fetch_calls(monkeypatch):
    """Patch get_adj_close to serve synthetic data and record every (start, end) call."""
    calls: list[tuple[date, date]] = []

    def fake_get_adj_close(session, tickers, start, end):
        calls.append((start, end))
        mask = (FULL_HISTORY.index.date >= start) & (FULL_HISTORY.index.date <= end)
        return FULL_HISTORY.loc[mask, tickers]

    monkeypatch.setattr(market_routes, "get_adj_close", fake_get_adj_close)
    # Shrink the fetch window from the production 15y default so the test still runs
    # fast, while staying long enough to comfortably cover both the 2020 and 2022
    # crisis presets.
    monkeypatch.setattr(market_routes, "FULL_HISTORY_YEARS", 7)
    market_routes._CACHE.clear()
    app.dependency_overrides[get_session] = lambda: iter([None])
    yield calls
    app.dependency_overrides.pop(get_session, None)


def _payload(**overrides) -> dict:
    base = {
        "tickers": TICKERS,
        "portfolio_value": 1_000_000,
        "estimation_window_days": 252,
        "confidence_levels": [0.95],
    }
    base.update(overrides)
    return base


def test_crisis_window_does_not_change_fetch_range_or_todays_var(fetch_calls):
    client = TestClient(app)

    resp_none = client.post("/api/market-risk/analyze", json=_payload())
    resp_2020 = client.post(
        "/api/market-risk/analyze", json=_payload(crisis_window="2020")
    )
    resp_2022 = client.post(
        "/api/market-risk/analyze", json=_payload(crisis_window="2022")
    )

    assert resp_none.status_code == 200, resp_none.text
    assert resp_2020.status_code == 200, resp_2020.text
    assert resp_2022.status_code == 200, resp_2022.text

    # The expensive computation (fetch + GARCH + full backtest) must run exactly once:
    # crisis_window must never trigger a re-fetch or a recompute of the bundle.
    assert len(fetch_calls) == 1, (
        f"expected a single fetch shared across crisis_window values, got {fetch_calls}"
    )
    fetched_start, fetched_end = fetch_calls[0]
    assert fetched_end == date.today()
    assert fetched_start == date.today() - timedelta(days=7 * 365)

    body_none = resp_none.json()
    body_2020 = resp_2020.json()
    body_2022 = resp_2022.json()

    # Core regression: "today's" VaR/ES and the portfolio end_date must be identical
    # regardless of which crisis_window was requested.
    assert body_none["var_comparison"] == body_2020["var_comparison"]
    assert body_none["var_comparison"] == body_2022["var_comparison"]
    assert body_none["portfolio"]["end_date"] == body_2020["portfolio"]["end_date"]
    assert body_none["portfolio"]["end_date"] == body_2022["portfolio"]["end_date"]
    assert body_none["portfolio"]["end_date"] != "2020-12-31"

    # The full-history backtest (Kupiec/Christoffersen/CC) must also be identical
    # across crisis_window values, and run on the whole sample, not a small window.
    assert body_none["backtest"] == body_2020["backtest"]
    assert body_none["backtest"] == body_2022["backtest"]
    n_obs = body_none["backtest"]["historical"]["total_observations"]
    assert n_obs > 1000, f"expected a full-history backtest sample, got {n_obs}"

    # crisis_window must still work as a *slice* of the chart data.
    dates_2020 = [date.fromisoformat(d) for d in body_2020["actual_pnl"]["dates"]]
    assert dates_2020, "expected non-empty P&L series for the 2020 crisis window"
    assert all(date(2020, 1, 1) <= d <= date(2020, 12, 31) for d in dates_2020)

    dates_2022 = [date.fromisoformat(d) for d in body_2022["actual_pnl"]["dates"]]
    assert dates_2022, "expected non-empty P&L series for the 2022 crisis window"
    assert all(date(2022, 1, 1) <= d <= date(2022, 12, 31) for d in dates_2022)

    # Without a crisis_window, the chart should show the entire backtested history.
    dates_none = body_none["actual_pnl"]["dates"]
    assert len(dates_none) == n_obs
