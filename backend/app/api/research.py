from fastapi import APIRouter, Query
from app.integrations.parallel import parallel_service
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/research", tags=["Parallel External Research Intelligence"])

@router.get("", response_model=ApiResponse[dict])
async def search_cinema_research(
    query: str = Query(..., description="Research query for visual styles, instruments, locations, or props"),
    category: str = Query("cinematography", description="Domain category: cinematography, acoustic, historical, props")
):
    result = await parallel_service.search_intelligence(query, category)
    return ApiResponse(
        success=True,
        message=f"Research synthesis completed for '{query}'.",
        data=result
    )
