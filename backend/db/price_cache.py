"""
Sistem de chaching pt preturile actiunilor stocate in Postgres. Fetch doar pe datele lipsa si le adaug in DB.

Aceasta înlocuiește vechea comandă _fetch_adj_close din market_risk_routes.py, care activa necondiționat yfinance la fiecare solicitare.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta

import pandas as pd
import yfinance as yf
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlmodel import Session, select

from models import PriceHistory


class TickerNotFoundError(Exception):
    def __init__(self, ticker: str):
        self.ticker = ticker
        super().__init__(f"Nu exista date pt ticker-ul: {ticker}")


def _cached_range(session: Session, ticker: str) -> tuple[date, date] | None:
    stmt = (
        select(PriceHistory.date)
        .where(PriceHistory.ticker == ticker)
        .order_by(PriceHistory.date)
    )
    rows = session.exec(stmt).all()
    if not rows:
        return None
    return rows[0], rows[-1]


def _missing_ranges(
    start: date, end: date, cached_min: date, cached_max: date
) -> list[tuple[date, date]]:
    """Sub-intervale de [start, end] care nu sunt deja acoperite de [cached_min, cached_max]."""
    if end < cached_min or start > cached_max:
        return [(start, end)]  # no overlap at all — fetch the whole thing
    gaps = []
    if start < cached_min:
        gaps.append((start, cached_min - timedelta(days=1)))
    if end > cached_max:
        gaps.append((cached_max + timedelta(days=1), end))
    return gaps


def _upsert_prices(session: Session, ticker: str, series: pd.Series) -> None:
    if series.empty:
        return
    now = datetime.utcnow()
    rows = [
        {
            "ticker": ticker,
            "date": idx.date() if hasattr(idx, "date") else idx,
            "adj_close": float(value),
            "fetched_at": now,
        }
        for idx, value in series.items()
        if pd.notna(value)
    ]
    if not rows:
        return
    stmt = pg_insert(PriceHistory.__table__).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=["ticker", "date"],
        set_={
            "adj_close": stmt.excluded.adj_close,
            "fetched_at": stmt.excluded.fetched_at,
        },
    )
    session.exec(stmt)
    session.commit()


def _read_cached_series(
    session: Session, ticker: str, start: date, end: date
) -> pd.Series:
    stmt = (
        select(PriceHistory.date, PriceHistory.adj_close)
        .where(PriceHistory.ticker == ticker)
        .where(PriceHistory.date >= start)
        .where(PriceHistory.date <= end)
        .order_by(PriceHistory.date)
    )
    rows = session.exec(stmt).all()
    if not rows:
        return pd.Series(dtype=float)
    dates, values = zip(*rows)
    return pd.Series(values, index=pd.DatetimeIndex(dates), name=ticker)


def _fetch_from_yfinance(ticker: str, start: date, end: date) -> pd.Series:
    """`end` aici este inclusiv; parametrul `end` al yfinance este exclusiv, de aceea se adaugă +1 zi."""
    raw = yf.download(
        ticker,
        start=start,
        end=end + timedelta(days=1),
        auto_adjust=True,
        progress=False,
    )
    if raw.empty:
        return pd.Series(dtype=float)
    close = raw["Close"]
    if hasattr(
        close, "columns"
    ):  # yfinance can return a 1-col DataFrame for a single ticker
        close = close[ticker] if ticker in close.columns else close.iloc[:, 0]
    return close


def get_adj_close(
    session: Session, tickers: list[str], start: date, end: date
) -> pd.DataFrame:
    """Se asigură că Postgres acoperă [start, end] pentru fiecare ticker (preluând doar
    intervalele lipsă de la yfinance), apoi returnează DataFrame-ul combinat citit înapoi din DB.
    """
    for ticker in tickers:
        cached = _cached_range(session, ticker)
        gaps = (
            [(start, end)] if cached is None else _missing_ranges(start, end, *cached)
        )
        for gap_start, gap_end in gaps:
            if gap_start > gap_end:
                continue
            fetched = _fetch_from_yfinance(ticker, gap_start, gap_end)
            _upsert_prices(session, ticker, fetched)

    columns = {}
    for ticker in tickers:
        series = _read_cached_series(session, ticker, start, end)
        if series.empty:
            raise TickerNotFoundError(ticker)
        columns[ticker] = series
    return pd.DataFrame(columns)
