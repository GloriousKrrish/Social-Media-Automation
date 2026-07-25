from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Workspace, UserWorkspaceRole
from app.repositories.base import BaseRepository


class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self, session: AsyncSession):
        super().__init__(Workspace, session)

    async def get_user_workspaces(self, user_id: str) -> List[Workspace]:
        query = (
            select(Workspace)
            .join(UserWorkspaceRole, Workspace.id == UserWorkspaceRole.workspace_id)
            .where(UserWorkspaceRole.user_id == user_id)
            .where(Workspace.is_deleted == False)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Optional[Workspace]:
        query = (
            select(Workspace)
            .where(Workspace.slug == slug)
            .where(Workspace.is_deleted == False)
        )
        result = await self.session.execute(query)
        return result.scalars().first()
