from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/audit-logs", tags=["Audit & Security"])


class AuditLogSchema(BaseModel):
    id: str
    actor_id: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    ip_address: Optional[str]
    created_at: str


@router.get("", response_model=List[AuditLogSchema])
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    return [
        AuditLogSchema(
            id="audit-1",
            actor_id="usr-101",
            action="user:login",
            resource_type="auth",
            resource_id=None,
            ip_address="127.0.0.1",
            created_at="2026-07-24T12:00:00Z",
        )
    ]
