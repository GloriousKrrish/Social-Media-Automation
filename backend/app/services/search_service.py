from typing import List, Dict, Any


class SearchService:
    _index: List[Dict[str, Any]] = [
        {"id": "srch-1", "title": "Strategy Orchestrator Agent", "category": "agent", "route": "/agents"},
        {"id": "srch-2", "title": "B2B SaaS Growth Campaign", "category": "campaign", "route": "/campaigns"},
        {"id": "srch-3", "title": "Weekly Content Queue", "category": "approvals", "route": "/approvals"},
        {"id": "srch-4", "title": "API Credentials Settings", "category": "settings", "route": "/settings"},
    ]

    @classmethod
    async def query_search(cls, q: str) -> List[Dict[str, Any]]:
        query_str = (q or "").strip().lower()
        if not query_str:
            return []
        return [
            item for item in cls._index
            if query_str in item["title"].lower() or query_str in item["category"].lower()
        ]
