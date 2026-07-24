from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter(tags=["Health & Diagnostics"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "service": "SocialPilot AI Enterprise Core Engine",
        "version": "1.0.0",
        "database": db_status,
    }


@router.get("/metrics")
async def metrics():
    return {
        "active_connections": 1,
        "uptime_seconds": 3600,
        "system_status": "operational",
    }
