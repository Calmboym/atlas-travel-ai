"""SQLAlchemy declarative base.

ADDED — ATLAS-P1-AUTH-02. First real database wiring — backend/app/
had no application code before this task.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
