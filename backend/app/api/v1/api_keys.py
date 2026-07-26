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


from app.services.api_key_service import ApiKeyService


@router.get("", response_model=List[ApiKeySchema])
async def list_api_keys(db: AsyncSession = Depends(get_db)):
    return await ApiKeyService.list_keys()


@router.post("", response_model=ApiKeySchema, status_code=status.HTTP_201_CREATED)
async def create_api_key(payload: CreateApiKeySchema, db: AsyncSession = Depends(get_db)):
    return await ApiKeyService.create_key(payload)
