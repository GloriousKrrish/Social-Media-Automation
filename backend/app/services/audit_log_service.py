from typing import List
from app.api.v1.audit_logs import AuditLogSchema


class AuditLogService:
    @staticmethod
    async def get_logs() -> List[AuditLogSchema]:
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
