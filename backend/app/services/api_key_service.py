import uuid
import datetime
from typing import List
from app.api.v1.api_keys import ApiKeySchema, CreateApiKeySchema


class ApiKeyService:
    _db: List[ApiKeySchema] = [
        ApiKeySchema(
            id="key-1",
            name="Production Automation Worker Key",
            prefix="sp_live_9a8b7c",
            created_at="2026-07-24T10:00:00Z",
        )
    ]

    @classmethod
    async def list_keys(cls) -> List[ApiKeySchema]:
        return cls._db

    @classmethod
    async def create_key(cls, payload: CreateApiKeySchema) -> ApiKeySchema:
        new_key = ApiKeySchema(
            id=f"key-{uuid.uuid4().hex[:6]}",
            name=payload.name,
            prefix=f"sp_live_{uuid.uuid4().hex[:6]}",
            created_at=datetime.datetime.utcnow().isoformat() + "Z",
        )
        cls._db.append(new_key)
        return new_key
