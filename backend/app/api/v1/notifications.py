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


from app.services.notification_service import NotificationService


@router.get("", response_model=List[NotificationSchema])
async def list_notifications(db: AsyncSession = Depends(get_db)):
    return await NotificationService.get_notifications()
