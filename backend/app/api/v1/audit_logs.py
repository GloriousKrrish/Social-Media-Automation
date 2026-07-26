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


from app.services.audit_log_service import AuditLogService


@router.get("", response_model=List[AuditLogSchema])
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    return await AuditLogService.get_logs()
