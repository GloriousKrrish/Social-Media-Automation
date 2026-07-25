from typing import List, Optional
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/search", tags=["Global Search"])


class SearchResultItem(BaseModel):
    id: str
    title: str
    description: str
    category: str  # agent, automation, template, workspace, navigation
    icon_name: str
    route: Optional[str] = None


@router.get("", response_model=List[SearchResultItem])
async def global_search(
    q: str = Query("", min_length=0), db: AsyncSession = Depends(get_db)
):
    all_items = [
        SearchResultItem(id="agent-1", title="Strategy Orchestrator", description="AI Agent for campaign strategy & channel split", category="agent", icon_name="Bot", route="/agents"),
        SearchResultItem(id="agent-2", title="Content Crafter", description="Generates platform-tailored post drafts", category="agent", icon_name="Bot", route="/agents"),
        SearchResultItem(id="auto-1", title="Auto-Publish Approved Posts", description="Triggered on approval gate approval", category="automation", icon_name="Zap", route="/automation"),
        SearchResultItem(id="nav-1", title="Dashboard", description="Overview KPI metrics & active queue", category="navigation", icon_name="Navigation", route="/dashboard"),
        SearchResultItem(id="nav-2", title="Publishing Queue & Approvals", description="Manage pending post approvals & errors", category="navigation", icon_name="Calendar", route="/approvals"),
        SearchResultItem(id="nav-3", title="Settings & API Keys", description="Platform keys & security settings", category="navigation", icon_name="Settings", route="/settings"),
    ]

    if not q:
        return all_items

    query_str = q.lower()
    return [
        item for item in all_items
        if query_str in item.title.lower() or query_str in item.description.lower() or query_str in item.category.lower()
    ]
