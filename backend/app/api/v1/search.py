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


from app.services.search_service import SearchService


@router.get("", response_model=List[SearchResultItem])
async def global_search(
    q: str = Query("", min_length=0), db: AsyncSession = Depends(get_db)
):
    results = await SearchService.query_search(q)
    return [
        SearchResultItem(
            id=item["id"],
            title=item["title"],
            description=f"Search result for {item['title']}",
            category=item["category"],
            icon_name="Search",
            route=item["route"],
        )
        for item in results
    ]
