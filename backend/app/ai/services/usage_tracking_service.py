from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.models.ai_models import AIHistoryRecord, AIUsageStat
from app.ai.schemas.ai_schemas import AIUsageStatResponse


class UsageTrackingService:
    @staticmethod
    async def record_usage(
        db: AsyncSession,
        workspace_id: str,
        provider: str,
        model: str,
        latency_ms: float,
        tokens_used: int = 0,
        success: bool = True,
    ) -> None:
        """Record a single AI operation usage event to the database."""
        # Try to find existing stat row for this workspace+provider+model
        result = await db.execute(
            select(AIUsageStat).where(
                AIUsageStat.workspace_id == workspace_id,
                AIUsageStat.provider == provider,
                AIUsageStat.model == model,
            )
        )
        stat = result.scalars().first()

        if stat:
            stat.request_count += 1
            if success:
                stat.successful_count += 1
            else:
                stat.failed_count += 1
            stat.total_tokens += tokens_used
            stat.total_latency_ms += latency_ms
        else:
            stat = AIUsageStat(
                workspace_id=workspace_id,
                provider=provider,
                model=model,
                request_count=1,
                successful_count=1 if success else 0,
                failed_count=0 if success else 1,
                total_tokens=tokens_used,
                total_latency_ms=latency_ms,
            )
            db.add(stat)

        await db.commit()

    @staticmethod
    async def get_usage_stats(
        db: AsyncSession, workspace_id: Optional[str] = None
    ) -> AIUsageStatResponse:
        """Retrieve aggregate usage statistics from AI history records."""
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

    # Keep backward compat alias
    get_usage_summary = get_usage_stats
