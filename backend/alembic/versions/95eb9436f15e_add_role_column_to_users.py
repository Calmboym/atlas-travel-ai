"""add role column to users

Revision ID: 95eb9436f15e
Revises: c1f834af0629
Create Date: 2026-08-24 03:46:38.384949

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '95eb9436f15e'
down_revision: Union[str, Sequence[str], None] = 'c1f834af0629'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# FIXED — autogenerate emitted `op.add_column(..., sa.Enum(...))`
# without first creating the Postgres enum TYPE itself. That works
# for op.create_table (SQLAlchemy creates the type as part of table
# DDL) but NOT for op.add_column on an existing table — confirmed by
# actually running this migration: `type "user_role" does not exist`.
# Explicit create()/drop() calls, checkfirst=True so this migration
# stays safely re-runnable.
user_role_enum = postgresql.ENUM('user', 'admin', 'system', name='user_role')


def upgrade() -> None:
    """Upgrade schema."""
    user_role_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        'users',
        sa.Column('role', user_role_enum, server_default='user', nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')
    user_role_enum.drop(op.get_bind(), checkfirst=True)
