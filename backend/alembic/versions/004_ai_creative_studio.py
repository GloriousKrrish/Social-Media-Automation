"""AI Creative Studio & Image Management Migration

Revision ID: 004_ai_creative_studio
Revises: 003_ai_content_engine
Create Date: 2026-07-27 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_ai_creative_studio'
down_revision = '003_ai_content_engine'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Workspace Brand Kits Table
    op.create_table(
        'workspace_brand_kits',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('brand_name', sa.String(length=255), nullable=False, server_default='SocialPilot AI'),
        sa.Column('brand_description', sa.Text(), nullable=True),
        sa.Column('primary_color', sa.String(length=20), nullable=False, server_default='#2563EB'),
        sa.Column('secondary_color', sa.String(length=20), nullable=False, server_default='#7C3AED'),
        sa.Column('typography', sa.String(length=100), nullable=False, server_default='Plus Jakarta Sans'),
        sa.Column('logo_url', sa.String(length=512), nullable=True),
        sa.Column('preferred_visual_style', sa.String(length=50), nullable=False, server_default='photorealistic'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_workspace_brand_kits_workspace_id'), 'workspace_brand_kits', ['workspace_id'], unique=True)

    # 2. AI Image Records Table
    op.create_table(
        'ai_image_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=True),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('rendered_prompt', sa.Text(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False, server_default='pollinations'),
        sa.Column('style', sa.String(length=50), nullable=False, server_default='photorealistic'),
        sa.Column('aspect_ratio', sa.String(length=20), nullable=False, server_default='1:1'),
        sa.Column('width', sa.Integer(), nullable=False, server_default='1080'),
        sa.Column('height', sa.Integer(), nullable=False, server_default='1080'),
        sa.Column('image_url', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='success'),
        sa.Column('latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ai_image_records_workspace_id'), 'ai_image_records', ['workspace_id'], unique=False)
    op.create_index(op.f('ix_ai_image_records_provider'), 'ai_image_records', ['provider'], unique=False)
    op.create_index(op.f('ix_ai_image_records_style'), 'ai_image_records', ['style'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_image_records_style'), table_name='ai_image_records')
    op.drop_index(op.f('ix_ai_image_records_provider'), table_name='ai_image_records')
    op.drop_index(op.f('ix_ai_image_records_workspace_id'), table_name='ai_image_records')
    op.drop_table('ai_image_records')

    op.drop_index(op.f('ix_workspace_brand_kits_workspace_id'), table_name='workspace_brand_kits')
    op.drop_table('workspace_brand_kits')
