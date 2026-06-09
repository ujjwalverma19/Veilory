"""
alembic/env.py — Alembic Migration Environment
===============================================
Connects Alembic to the SQLAlchemy models and PostgreSQL database
so ``alembic revision --autogenerate`` can detect schema changes.

Design decisions:
  • The backend directory is added to ``sys.path`` so ``app.*`` imports
    resolve correctly when alembic is run from the project root.
  • ``config.set_main_option`` overrides the ``sqlalchemy.url`` from
    ``alembic.ini`` with the actual connection string from our Settings
    — this means the .ini file never contains credentials.
  • ``render_as_batch=True`` is enabled for SQLite compatibility during
    local testing, but has no negative effect on PostgreSQL.
"""

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# ── Ensure app imports resolve ───────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.database import Base  # noqa: E402
from app.db.models import Experience, SearchHistory, User  # noqa: E402, F401  — register models

# ── Alembic config ───────────────────────────────────────────────────
config = context.config
config.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ── Offline (SQL script) migrations ─────────────────────────────────


def run_migrations_offline() -> None:
    """Generate SQL migration scripts without a live database."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online (live database) migrations ───────────────────────────────


def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
