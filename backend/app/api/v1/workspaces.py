from typing import List, Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/workspaces", tags=["Workspaces & Multi-Tenancy"])


class WorkspaceSchema(BaseModel):
    id: str
    name: str
    slug: str
    organization_id: str
    members_count: int = 1


class CreateWorkspaceSchema(BaseModel):
    name: str
    organization_id: str


from app.services.workspace_service import WorkspaceService


@router.get("", response_model=List[WorkspaceSchema])
async def list_workspaces(db: AsyncSession = Depends(get_db)):
    return await WorkspaceService.get_workspaces()


@router.post("", response_model=WorkspaceSchema, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    payload: CreateWorkspaceSchema, db: AsyncSession = Depends(get_db)
):
    return WorkspaceSchema(
        id=f"ws-{payload.name.lower().replace(' ', '-')}",
        name=payload.name,
        slug=payload.name.lower().replace(" ", "-"),
        organization_id=payload.organization_id,
        members_count=1,
    )
