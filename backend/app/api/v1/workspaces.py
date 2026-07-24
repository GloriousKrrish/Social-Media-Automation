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


@router.get("", response_model=List[WorkspaceSchema])
async def list_workspaces(db: AsyncSession = Depends(get_db)):
    return [
        WorkspaceSchema(
            id="ws-1",
            name="Acme Corp SaaS",
            slug="acme-saas",
            organization_id="org-1",
            members_count=14,
        ),
        WorkspaceSchema(
            id="ws-2",
            name="Global Marketing",
            slug="global-marketing",
            organization_id="org-1",
            members_count=8,
        ),
    ]


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
