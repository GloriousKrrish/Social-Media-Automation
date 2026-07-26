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


api_keys_db: List[ApiKeySchema] = [
    ApiKeySchema(
        id="key-1",
        name="Production Automation Worker Key",
        prefix="sp_live_9a8b7c",
        created_at="2026-07-24T10:00:00Z",
    )
]


@router.get("", response_model=List[ApiKeySchema])
async def list_api_keys(db: AsyncSession = Depends(get_db)):
    return api_keys_db


@router.post("", response_model=ApiKeySchema, status_code=status.HTTP_201_CREATED)
async def create_api_key(payload: CreateApiKeySchema, db: AsyncSession = Depends(get_db)):
    import uuid, datetime
    new_key = ApiKeySchema(
        id=f"key-{uuid.uuid4().hex[:6]}",
        name=payload.name,
        prefix=f"sp_live_{uuid.uuid4().hex[:6]}",
        created_at=datetime.datetime.utcnow().isoformat() + "Z",
    )
    api_keys_db.append(new_key)
    return new_key
