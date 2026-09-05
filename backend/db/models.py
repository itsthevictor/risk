"""SQLModel table definitions for the Postgres cache."""

import datetime as dt

from sqlmodel import Field, SQLModel


class PriceHistory(SQLModel, table=True):
    """Un rand per (ticker, trading day). PK compus inseamna ca un upsert pe
    (ticker, date) este singura cale de scriere — nu sunt posibile randuri duplicate.

    Nota: campul este adnotat ca `dt.date` (calificat prin modul) mai degraba decat un
    import `date` simplu — denumirea unui camp `date` in timp ce se importa si tipul
    `date` in acelasi namespace strica rezolvarea adnotarilor in Pydantic v2.
    """

    __tablename__ = "price_history"

    ticker: str = Field(primary_key=True, max_length=16)
    date: dt.date = Field(primary_key=True)
    adj_close: float
    fetched_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)
