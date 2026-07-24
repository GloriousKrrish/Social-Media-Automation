from typing import List, Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


class ApiKeySchema(BaseModel):
    id: str
    name: str
    prefix: str
    created_at: str


class CreateApiKeySchema(BaseModel):
    name: str


@router.get("", response_model=List[ApiKeySchema])
async def list_api_keys(db: AsyncSession = Depends(get_db)):
    return [
        ApiKeySchema(
            id="key-1",
            name="Production Automation Worker Key",
            prefix="sp_live_...",
            created_at="2026-07-24T10:00:00Z",
        )
    ]


@router.post("", response_model=ApiKeySchema, status_code=status.HTTP_201_CREATED)
async def create_api_key(payload: CreateApiKeySchema, db: AsyncSession = Depends(get_db)):
    return ApiKeySchema(
        id="key-new",
        name=payload.name,
        prefix="sp_live_abc123",
        created_at="2026-07-24T15:30:00Z",
    )
