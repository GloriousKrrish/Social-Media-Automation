from typing import List
from app.api.v1.workspaces import WorkspaceSchema


class WorkspaceService:
    @staticmethod
    async def get_workspaces() -> List[WorkspaceSchema]:
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
