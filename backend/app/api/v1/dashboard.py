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


from app.services.dashboard_service import DashboardService


@router.get("/stats", response_model=DashboardStatsSchema)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    return await DashboardService.get_stats()
