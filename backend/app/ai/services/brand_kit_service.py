from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.models.ai_models import WorkspaceBrandKit
from app.ai.schemas.ai_schemas import WorkspaceBrandKitUpdate, WorkspaceBrandKitResponse


class BrandKitService:
    @staticmethod
    async def get_brand_kit(db: AsyncSession, workspace_id: str) -> WorkspaceBrandKitResponse:
        result = await db.execute(
            select(WorkspaceBrandKit).where(WorkspaceBrandKit.workspace_id == workspace_id)
        )
        brand_kit = result.scalars().first()

        if not brand_kit:
            brand_kit = WorkspaceBrandKit(
                workspace_id=workspace_id,
                brand_name="SocialPilot AI",
                brand_description="Enterprise Social Media & Content Automation Platform",
                primary_color="#2563EB",
                secondary_color="#7C3AED",
                typography="Plus Jakarta Sans",
                logo_url="",
                preferred_visual_style="photorealistic",
            )
            db.add(brand_kit)
            await db.commit()
            await db.refresh(brand_kit)

        return WorkspaceBrandKitResponse(
            id=brand_kit.id,
            workspace_id=brand_kit.workspace_id,
            brand_name=brand_kit.brand_name,
            brand_description=brand_kit.brand_description or "",
            primary_color=brand_kit.primary_color,
            secondary_color=brand_kit.secondary_color,
            typography=brand_kit.typography,
            logo_url=brand_kit.logo_url or "",
            preferred_visual_style=brand_kit.preferred_visual_style,
            created_at=str(brand_kit.created_at),
            updated_at=str(brand_kit.updated_at),
        )

    @staticmethod
    async def update_brand_kit(
        db: AsyncSession, workspace_id: str, updates: WorkspaceBrandKitUpdate
    ) -> WorkspaceBrandKitResponse:
        result = await db.execute(
            select(WorkspaceBrandKit).where(WorkspaceBrandKit.workspace_id == workspace_id)
        )
        brand_kit = result.scalars().first()

        if not brand_kit:
            brand_kit = WorkspaceBrandKit(workspace_id=workspace_id)
            db.add(brand_kit)

        update_data = updates.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(brand_kit, field, value)

        await db.commit()
        await db.refresh(brand_kit)

        return WorkspaceBrandKitResponse(
            id=brand_kit.id,
            workspace_id=brand_kit.workspace_id,
            brand_name=brand_kit.brand_name,
            brand_description=brand_kit.brand_description or "",
            primary_color=brand_kit.primary_color,
            secondary_color=brand_kit.secondary_color,
            typography=brand_kit.typography,
            logo_url=brand_kit.logo_url or "",
            preferred_visual_style=brand_kit.preferred_visual_style,
            created_at=str(brand_kit.created_at),
            updated_at=str(brand_kit.updated_at),
        )
