from typing import List
from app.api.v1.dashboard import DashboardStatsSchema, KPISchema


class DashboardService:
    @staticmethod
    async def get_stats() -> DashboardStatsSchema:
        return DashboardStatsSchema(
            total_published=1420,
            scheduled_posts=48,
            active_agents=12,
            avg_engagement=8.4,
            kpis=[
                KPISchema(id="published", label="Total Posts Published", value=1420, change=18.4, suffix="", icon="send", color="blue"),
                KPISchema(id="scheduled", label="Scheduled Posts", value=48, change=12.0, suffix="", icon="calendar", color="violet"),
                KPISchema(id="agents", label="Active AI Agents", value=12, change=2.0, suffix="", icon="bot", color="emerald"),
                KPISchema(id="engagement", label="Avg. Engagement Rate", value=8, change=3.2, suffix="%", icon="activity", color="gold"),
            ]
        )
