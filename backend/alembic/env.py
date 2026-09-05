import os
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy import pool
from sqlmodel import SQLModel

from alembic import context
from db.url import normalize_database_url

load_dotenv()

import db.models  # noqa: F401

config = context.config

# DATABASE_URL poate conține caractere literale '%' (ex: parolă cu %2F),
# iar ConfigParser-ul din spatele Alembic tratează '%' ca interpolare —
# deci citim variabila direct din environment, nu o mai trecem prin
# config.set_main_option()/sqlalchemy.url din alembic.ini.
DATABASE_URL = normalize_database_url(os.environ["DATABASE_URL"])

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
