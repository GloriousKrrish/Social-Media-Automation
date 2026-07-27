"""AI Content Engine Migration

Revision ID: 003_ai_content_engine
Revises: 002_ai_platform_foundation
Create Date: 2026-07-27 11:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_ai_content_engine'
down_revision = '002_ai_platform_foundation'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add columns to ai_history_records table
    op.add_column('ai_history_records', sa.Column('rendered_prompt', sa.Text(), nullable=True))
    op.add_column('ai_history_records', sa.Column('generation_type', sa.String(length=50), nullable=True, server_default='general'))
    op.create_index(op.f('ix_ai_history_records_generation_type'), 'ai_history_records', ['generation_type'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_history_records_generation_type'), table_name='ai_history_records')
    op.drop_column('ai_history_records', 'generation_type')
    op.drop_column('ai_history_records', 'rendered_prompt')
