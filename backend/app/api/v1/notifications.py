from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationSchema(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool


@router.get("", response_model=List[NotificationSchema])
async def list_notifications(db: AsyncSession = Depends(get_db)):
    return [
        NotificationSchema(
            id="notif-1",
            title="Campaign Published",
            message="AI Campaign #47 published to 6 accounts",
            type="success",
            is_read=False,
        ),
        NotificationSchema(
            id="notif-2",
            title="Trend Detected",
            message="#AIProductivity trending +840% on Twitter",
            type="info",
            is_read=False,
        ),
    ]
