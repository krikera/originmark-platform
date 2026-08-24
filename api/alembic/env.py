"""
Alembic environment configuration for OriginMark.

Reads the database URL from the DATABASE_URL environment variable
(same source as db.py) and uses the existing SQLAlchemy models
for autogenerate support.
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Ensure the api/ directory is on sys.path so we can import db
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from db import Base, DATABASE_URL  # noqa: E402

# Alembic Config object
config = context.config

# Override sqlalchemy.url from environment variable, escaping % for configparser
escaped_url = DATABASE_URL.replace("%", "%%") if DATABASE_URL else ""
config.set_main_option("sqlalchemy.url", escaped_url)

# Set up Python logging from the config file
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Point Alembic at our models' metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    Configures the context with just a URL (no Engine needed).
    Calls to context.execute() emit SQL to the script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,  # Required for SQLite ALTER TABLE support
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    Creates an Engine and associates a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,  # Required for SQLite ALTER TABLE support
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
