"""AI Platform Foundation Migration

Revision ID: 002_ai_platform_foundation
Revises: 001_initial_infrastructure
Create Date: 2026-07-27 11:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_ai_platform_foundation'
down_revision = '001_initial_infrastructure'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Workspace AI Settings Table
    op.create_table(
        'workspace_ai_settings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('preferred_provider', sa.String(length=50), nullable=False, server_default='openai'),
        sa.Column('preferred_model', sa.String(length=100), nullable=False, server_default='gpt-4o'),
        sa.Column('default_language', sa.String(length=50), nullable=False, server_default='English'),
        sa.Column('writing_tone', sa.String(length=50), nullable=False, server_default='Professional'),
        sa.Column('creativity', sa.Float(), nullable=False, server_default='0.7'),
        sa.Column('target_audience', sa.String(length=100), nullable=False, server_default='General Business'),
        sa.Column('brand_voice', sa.String(length=255), nullable=False, server_default='Empathetic & Authoritative'),
        sa.Column('response_length', sa.String(length=50), nullable=False, server_default='Medium'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_workspace_ai_settings_workspace_id'), 'workspace_ai_settings', ['workspace_id'], unique=True)

    # 2. AI History Records Table
    op.create_table(
        'ai_history_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=True),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('response', sa.Text(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='success'),
        sa.Column('latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('usage_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ai_history_records_workspace_id'), 'ai_history_records', ['workspace_id'], unique=False)
    op.create_index(op.f('ix_ai_history_records_provider'), 'ai_history_records', ['provider'], unique=False)

    # 3. AI Usage Stats Table
    op.create_table(
        'ai_usage_stats',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=True),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('request_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('successful_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('failed_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ai_usage_stats_workspace_id'), 'ai_usage_stats', ['workspace_id'], unique=False)
    op.create_index(op.f('ix_ai_usage_stats_provider'), 'ai_usage_stats', ['provider'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_usage_stats_provider'), table_name='ai_usage_stats')
    op.drop_index(op.f('ix_ai_usage_stats_workspace_id'), table_name='ai_usage_stats')
    op.drop_table('ai_usage_stats')

    op.drop_index(op.f('ix_ai_history_records_provider'), table_name='ai_history_records')
    op.drop_index(op.f('ix_ai_history_records_workspace_id'), table_name='ai_history_records')
    op.drop_table('ai_history_records')

    op.drop_index(op.f('ix_workspace_ai_settings_workspace_id'), table_name='workspace_ai_settings')
    op.drop_table('workspace_ai_settings')
