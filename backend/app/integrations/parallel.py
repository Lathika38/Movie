import httpx
from typing import Any, Dict, List, Optional
from app.core.config import settings

class ParallelResearchService:
    """
    Parallel API client for external intelligence:
    - Director: Visual references, architectural cinematography styles, camera rigs.
    - Producer: Location permits, standard union crew rates, logistics references.
    - Actor: Character profession background, psychological research, historical context.
    - Music Director: Cultural instruments, ethnic scales, historical acoustic references.
    """
    def __init__(self):
        self.api_key = settings.PARALLEL_API_KEY
        self.base_url = "https://api.parallel.ai/v1"

    async def search_intelligence(self, query: str, category: str = "cinematography") -> Dict[str, Any]:
        if self.api_key and self.api_key.strip():
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        f"{self.base_url}/search",
                        headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                        json={"query": query, "category": category, "max_results": 5}
                    )
                    if resp.status_code == 200:
                        return resp.json()
            except Exception as e:
                print(f" [MovieOS Parallel] Parallel API error: {e}")

        # Do NOT fall back to fabricated research data
        return {
            "available": False,
            "query": query,
            "category": category,
            "error": "Unable to complete research from Parallel API."
        }

parallel_service = ParallelResearchService()
