import os

from dotenv import load_dotenv
from sqlmodel import Session, create_engine
from db.url import normalize_database_url

load_dotenv()

DATABASE_URL = normalize_database_url(os.environ["DATABASE_URL"])


engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def get_session():
    """FastAPI dependency: `session: Session = Depends(get_session)`."""
    with Session(engine) as session:
        yield session
