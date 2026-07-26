from typing import Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/settings", tags=["Platform & Account Settings"])


class AppSettingsSchema(BaseModel):
    brand_name: str = "SocialPilot AI"
    timezone: str = "UTC"
    date_format: str = "YYYY-MM-DD"
    auto_publish: bool = True
    openai_key: Optional[str] = None
    anthropic_key: Optional[str] = None
    gemini_key: Optional[str] = None


from app.services.settings_service import SettingsService


@router.get("", response_model=AppSettingsSchema)
async def get_settings(db: AsyncSession = Depends(get_db)):
    return await SettingsService.get_settings()


@router.put("", response_model=AppSettingsSchema)
async def update_settings(
    payload: AppSettingsSchema, db: AsyncSession = Depends(get_db)
):
    return payload
