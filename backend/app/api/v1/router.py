from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.audit_logs import router as audit_logs_router
from app.api.v1.api_keys import router as api_keys_router

api_v1_router = APIRouter(prefix="/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(health_router)
api_v1_router.include_router(workspaces_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(audit_logs_router)
api_v1_router.include_router(api_keys_router)
