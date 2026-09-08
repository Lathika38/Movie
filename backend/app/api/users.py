from typing import List, Optional
from fastapi import APIRouter, Query
from app.core.database import db
from app.schemas.auth import UserResponse
from app.schemas.common import ApiResponse, UserRole

router = APIRouter(prefix="/users", tags=["Users & Talent Directory"])

@router.get("", response_model=ApiResponse[List[UserResponse]])
def list_users(
    role: Optional[UserRole] = None,
    search: Optional[str] = None
):
    filters = []
    if role:
        filters.append(("role", "==", role.value))
    
    users = db.query_collection("users", filters=filters)
    
    if search:
        s = search.lower()
        users = [u for u in users if s in u.get("name", "").lower() or s in u.get("email", "").lower() or any(s in sk.lower() for sk in u.get("skills", []))]

    res = [UserResponse(**u) for u in users]
    return ApiResponse(success=True, data=res)

@router.get("/actors", response_model=ApiResponse[List[UserResponse]])
def list_actors(
    genre: Optional[str] = None,
    skill: Optional[str] = None,
    available_only: bool = False
):
    actors = db.query_collection("users", filters=[("role", "==", "ACTOR")])
    if available_only:
        actors = [a for a in actors if a.get("availability", "Available") == "Available"]
    if genre:
        actors = [a for a in actors if genre.lower() in [g.lower() for g in a.get("genres", [])]]
    if skill:
        actors = [a for a in actors if skill.lower() in [s.lower() for s in a.get("skills", [])]]

    return ApiResponse(success=True, data=[UserResponse(**a) for a in actors])
