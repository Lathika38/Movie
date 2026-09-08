from typing import Optional
from fastapi import APIRouter, Query
from app.integrations.weather import weather_service
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/weather", tags=["Production Weather Intelligence"])

@router.get("", response_model=ApiResponse[dict])
async def get_filming_weather(
    location: str = Query("Los Angeles, CA", description="City or shooting location name"),
    date: Optional[str] = Query(None, description="Shooting date (YYYY-MM-DD)")
):
    weather_info = await weather_service.get_location_weather(location, date)
    return ApiResponse(
        success=True,
        message=f"Weather forecast for {location} retrieved.",
        data=weather_info
    )
