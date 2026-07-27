from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.models.ai_models import WorkspaceAISetting
from app.ai.schemas.ai_schemas import WorkspaceAISettingsUpdate, WorkspaceAISettingsResponse


class WorkspaceAIService:
    @staticmethod
    async def get_settings(db: AsyncSession, workspace_id: str) -> WorkspaceAISettingsResponse:
        result = await db.execute(
            select(WorkspaceAISetting).where(WorkspaceAISetting.workspace_id == workspace_id)
        )
        setting = result.scalars().first()

        if not setting:
            # Create default workspace settings
            setting = WorkspaceAISetting(
                workspace_id=workspace_id,
                preferred_provider="openai",
                preferred_model="gpt-4o",
                default_language="English",
                writing_tone="Professional",
                creativity=0.7,
                target_audience="General Business",
                brand_voice="Empathetic & Authoritative",
                response_length="Medium",
            )
            db.add(setting)
            await db.commit()
            await db.refresh(setting)

        return WorkspaceAISettingsResponse(
            id=setting.id,
            workspace_id=setting.workspace_id,
            preferred_provider=setting.preferred_provider,
            preferred_model=setting.preferred_model,
            default_language=setting.default_language,
            writing_tone=setting.writing_tone,
            creativity=setting.creativity,
            target_audience=setting.target_audience,
            brand_voice=setting.brand_voice,
            response_length=setting.response_length,
            created_at=str(setting.created_at),
            updated_at=str(setting.updated_at),
        )

    @staticmethod
    async def update_settings(
        db: AsyncSession, workspace_id: str, updates: WorkspaceAISettingsUpdate
    ) -> WorkspaceAISettingsResponse:
        result = await db.execute(
            select(WorkspaceAISetting).where(WorkspaceAISetting.workspace_id == workspace_id)
        )
        setting = result.scalars().first()

        if not setting:
            setting = WorkspaceAISetting(workspace_id=workspace_id)
            db.add(setting)

        update_data = updates.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(setting, field, value)

        await db.commit()
        await db.refresh(setting)

        return WorkspaceAISettingsResponse(
            id=setting.id,
            workspace_id=setting.workspace_id,
            preferred_provider=setting.preferred_provider,
            preferred_model=setting.preferred_model,
            default_language=setting.default_language,
            writing_tone=setting.writing_tone,
            creativity=setting.creativity,
            target_audience=setting.target_audience,
            brand_voice=setting.brand_voice,
            response_length=setting.response_length,
            created_at=str(setting.created_at),
            updated_at=str(setting.updated_at),
        )
