from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistics"])


class KPISchema(BaseModel):
    id: str
    label: str
    value: int
    change: float
    suffix: str = ""
    icon: str
    color: str


class DashboardStatsSchema(BaseModel):
    total_published: int = 1420
    scheduled_posts: int = 48
    active_agents: int = 12
    avg_engagement: float = 8.4
    kpis: List[KPISchema]


@router.get("/stats", response_model=DashboardStatsSchema)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
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
