from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.models.ai_models import AIHistoryRecord
from app.ai.schemas.ai_schemas import AIUsageStatResponse


class UsageTrackingService:
    @staticmethod
    async def get_usage_summary(
        db: AsyncSession, workspace_id: Optional[str] = None
    ) -> AIUsageStatResponse:
        query = select(AIHistoryRecord)
        if workspace_id:
            query = query.where(AIHistoryRecord.workspace_id == workspace_id)

        result = await db.execute(query)
        records = result.scalars().all()

        total_requests = len(records)
        successful_generations = sum(1 for r in records if r.status == "success")
        failed_generations = sum(1 for r in records if r.status != "success")
        total_latency = sum(r.latency_ms for r in records)
        average_latency_ms = round(total_latency / total_requests, 2) if total_requests > 0 else 0.0

        provider_dist: Dict[str, int] = {}
        total_tokens = 0

        for r in records:
            provider_dist[r.provider] = provider_dist.get(r.provider, 0) + 1
            meta = r.usage_metadata or {}
            raw = meta.get("raw_usage", {})
            total_tokens += raw.get("total_tokens", 0)

        return AIUsageStatResponse(
            total_requests=total_requests,
            successful_generations=successful_generations,
            failed_generations=failed_generations,
            average_latency_ms=average_latency_ms,
            total_tokens_used=total_tokens,
            provider_distribution=provider_dist,
        )
