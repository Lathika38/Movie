from fastapi import APIRouter
from seed_data import seed_database
from app.core.database import db
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/seed", tags=["Database Seeding & Reset"])

@router.post("", response_model=ApiResponse[dict])
def trigger_database_seed():
    seed_database()
    return ApiResponse(
        success=True,
        message="Cinema database seeded successfully with production data.",
        data={
            "moviesCount": len(db.query_collection("movies")),
            "usersCount": len(db.query_collection("users")),
            "scenesCount": len(db.query_collection("scenes")),
            "charactersCount": len(db.query_collection("characters")),
            "schedulesCount": len(db.query_collection("schedules")),
            "tracksCount": len(db.query_collection("musicTracks"))
        }
    )

@router.post("/reset", response_model=ApiResponse[bool])
def reset_database():
    db.clear_all()
    seed_database()
    return ApiResponse(success=True, message="Database reset and re-seeded with pristine cinema data.", data=True)
