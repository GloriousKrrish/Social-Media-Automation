from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.models.ai_models import AIHistoryRecord
from app.ai.schemas.ai_schemas import AIHistoryRecordResponse, TextGenerationResponse


class AIHistoryService:
    @staticmethod
    async def record_generation(
        db: AsyncSession,
        prompt: str,
        response: TextGenerationResponse,
        workspace_id: Optional[str] = None,
    ) -> AIHistoryRecordResponse:
        record = AIHistoryRecord(
            workspace_id=workspace_id,
            prompt=prompt,
            response=response.text,
            provider=response.provider,
            model=response.model,
            status="error" if response.finish_reason == "error" else "success",
            latency_ms=response.latency_ms,
            usage_metadata=response.usage_metadata,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        return AIHistoryRecordResponse(
            id=record.id,
            workspace_id=record.workspace_id,
            prompt=record.prompt,
            response=record.response,
            provider=record.provider,
            model=record.model,
            status=record.status,
            latency_ms=record.latency_ms,
            usage_metadata=record.usage_metadata or {},
            created_at=str(record.created_at),
        )

    @staticmethod
    async def get_workspace_history(
        db: AsyncSession,
        workspace_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[AIHistoryRecordResponse]:
        query = select(AIHistoryRecord)
        if workspace_id:
            query = query.where(AIHistoryRecord.workspace_id == workspace_id)
        query = query.order_by(AIHistoryRecord.created_at.desc()).limit(limit)

        result = await db.execute(query)
        records = result.scalars().all()

        return [
            AIHistoryRecordResponse(
                id=r.id,
                workspace_id=r.workspace_id,
                prompt=r.prompt,
                response=r.response,
                provider=r.provider,
                model=r.model,
                status=r.status,
                latency_ms=r.latency_ms,
                usage_metadata=r.usage_metadata or {},
                created_at=str(r.created_at),
            )
            for r in records
        ]
