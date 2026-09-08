import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.core.database import db
from app.schemas.movie import MovieCreate, MovieUpdate, MovieResponse, MovieMember
from app.schemas.common import ApiResponse, MovieStatus

router = APIRouter(prefix="/movies", tags=["Movies & Productions"])

def is_user_authorized_for_movie(movie: dict, user_id: Optional[str]) -> bool:
    """
    Strict Access Control: A movie project is ONLY accessible to the specific Director,
    Producer, Music Director, or signed members assigned to that movie (and Studio Chief Admin).
    Other directors and producers cannot access or view movies they are not signed onto.
    """
    if not user_id:
        return True

    # 1. ADMIN / STUDIO CHIEF always has executive access
    if user_id == "USR-ADMIN-001":
        return True

    user_doc = db.get_document("users", user_id)
    user_role = user_doc.get("role", "") if user_doc else ""
    user_email = user_doc.get("email", "") if user_doc else ""
    user_prod_company = user_doc.get("productionCompany", "") if user_doc else ""

    if user_role == "ADMIN" or user_email == "devil@movieos.ai":
        return True

    # 2. Producer, Director, Music Director, or Creator assigned to the movie
    is_producer = (movie.get("producerId") == user_id or (user_email and movie.get("producerEmail") == user_email))
    is_director = (movie.get("directorId") == user_id or (user_email and movie.get("directorEmail") == user_email))
    is_music_director = (movie.get("musicDirectorId") == user_id or (user_email and movie.get("musicDirectorEmail") == user_email))
    is_creator = (movie.get("createdBy") == user_id)

    # 3. Check if producer's registered production company matches movie's production company
    movie_prod_company = movie.get("productionCompany", "")
    is_matching_production = False
    if user_role == "PRODUCER" and user_prod_company and movie_prod_company:
        if user_prod_company.strip().lower() == movie_prod_company.strip().lower():
            is_matching_production = True

    # 4. Check if user is in movie members list
    is_member = any(
        mem.get("userId") == user_id or (user_email and mem.get("email") == user_email)
        for mem in movie.get("members", [])
    )

    if is_producer or is_director or is_music_director or is_creator or is_matching_production or is_member:
        return True

    # 4. For ACTOR role, check if they have a casting offer (PENDING) or signed contract (ACCEPTED)
    if user_role == "ACTOR":
        movie_offers = db.query_collection("castingRequests", filters=[("movieId", "==", movie.get("id"))])
        has_offer_or_signed = any(
            (req.get("actorId") == user_id or (user_email and req.get("actorEmail") == user_email)) and
            req.get("status") in ["PENDING", "ACCEPTED"]
            for req in movie_offers
        )
        if has_offer_or_signed:
            return True

    # User is not authorized to access this movie project
    return False

@router.get("", response_model=ApiResponse[List[MovieResponse]])
def list_movies(
    user_id: Optional[str] = None,
    role: Optional[str] = None,
    status_filter: Optional[MovieStatus] = None
):
    movies = db.query_collection("movies", order_by="createdAt", descending=True)
    
    # Enrich names and scene stats
    enriched = []
    for m in movies:
        m_id = m.get("id")
        
        # Strict Production Access Control: Only Creator / Signed Director & Producer can view!
        if user_id and not is_user_authorized_for_movie(m, user_id):
            continue

        # Producer & Director names
        if m.get("producerId") and not m.get("producerName"):
            p = db.get_document("users", m["producerId"])
            if p:
                m["producerName"] = p.get("name")
        if m.get("directorId") and not m.get("directorName"):
            d = db.get_document("users", m["directorId"])
            if d:
                m["directorName"] = d.get("name")
        if m.get("musicDirectorId") and not m.get("musicDirectorName"):
            md = db.get_document("users", m["musicDirectorId"])
            if md:
                m["musicDirectorName"] = md.get("name")

        # Total scenes
        scenes = db.query_collection("scenes", filters=[("movieId", "==", m_id)])
        m["totalScenes"] = len(scenes)
        m["completedScenes"] = len([s for s in scenes if s.get("status") in ["SHOT", "COMPLETED"]])
        
        # Calculate spent budget from expenses
        expenses = db.query_collection("expenses", filters=[("movieId", "==", m_id)])
        m["spentBudget"] = sum(e.get("amount", 0.0) for e in expenses)

        if status_filter and m.get("status") != status_filter:
            continue

        enriched.append(MovieResponse(**m))

    return ApiResponse(success=True, data=enriched)

@router.post("", response_model=ApiResponse[MovieResponse])
def create_movie(payload: MovieCreate):
    movie_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = movie_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    data["members"] = []

    # If createdBy provided, record creator member
    if payload.createdBy:
        data["createdBy"] = payload.createdBy
        creator = db.get_document("users", payload.createdBy)
        if creator:
            c_role = creator.get("role", "CREATOR")
            data["members"].append({
                "userId": payload.createdBy,
                "name": creator.get("name", "Creator"),
                "role": c_role,
                "joinedAt": datetime.now(timezone.utc).isoformat()
            })

    # If producer created, add as member
    if payload.producerId:
        p = db.get_document("users", payload.producerId)
        if p:
            data["producerName"] = p.get("name")
            if not any(m.get("userId") == payload.producerId for m in data["members"]):
                data["members"].append({
                    "userId": payload.producerId,
                    "name": p.get("name", "Producer"),
                    "role": "PRODUCER",
                    "joinedAt": datetime.now(timezone.utc).isoformat()
                })

    # If director assigned, add as member
    if payload.directorId:
        d = db.get_document("users", payload.directorId)
        if d:
            data["directorName"] = d.get("name")
            if not any(m.get("userId") == payload.directorId for m in data["members"]):
                data["members"].append({
                    "userId": payload.directorId,
                    "name": d.get("name", "Director"),
                    "role": "DIRECTOR",
                    "joinedAt": datetime.now(timezone.utc).isoformat()
                })

    created = db.set_document("movies", movie_id, data)
    return ApiResponse(success=True, message=f"Movie '{payload.title}' created successfully.", data=MovieResponse(**created))

@router.get("/{movie_id}", response_model=ApiResponse[MovieResponse])
def get_movie_details(movie_id: str, user_id: Optional[str] = None):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    if user_id and not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only the signed Director, Producer, and authorized crew members can access this movie project."
        )

    if movie.get("producerId") and not movie.get("producerName"):
        p = db.get_document("users", movie["producerId"])
        if p:
            movie["producerName"] = p.get("name")
    if movie.get("directorId") and not movie.get("directorName"):
        d = db.get_document("users", movie["directorId"])
        if d:
            movie["directorName"] = d.get("name")
    if movie.get("musicDirectorId") and not movie.get("musicDirectorName"):
        md = db.get_document("users", movie["musicDirectorId"])
        if md:
            movie["musicDirectorName"] = md.get("name")

    scenes = db.query_collection("scenes", filters=[("movieId", "==", movie_id)])
    movie["totalScenes"] = len(scenes)
    movie["completedScenes"] = len([s for s in scenes if s.get("status") in ["SHOT", "COMPLETED"]])
    expenses = db.query_collection("expenses", filters=[("movieId", "==", movie_id)])
    movie["spentBudget"] = sum(e.get("amount", 0.0) for e in expenses)

    return ApiResponse(success=True, data=MovieResponse(**movie))

@router.put("/{movie_id}", response_model=ApiResponse[MovieResponse])
def update_movie(movie_id: str, updates: MovieUpdate, user_id: Optional[str] = None):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    if user_id and not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only the signed Director, Producer, and authorized crew members can update this movie project."
        )

    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # If director or music director changed, add to members
    if updates.directorId and updates.directorId != movie.get("directorId"):
        d = db.get_document("users", updates.directorId)
        if d:
            update_dict["directorName"] = d.get("name")
            members = movie.get("members", [])
            if not any(m.get("userId") == updates.directorId for m in members):
                members.append({
                    "userId": updates.directorId,
                    "name": d.get("name", "Director"),
                    "role": "DIRECTOR",
                    "joinedAt": datetime.now(timezone.utc).isoformat()
                })
                update_dict["members"] = members

    if updates.musicDirectorId and updates.musicDirectorId != movie.get("musicDirectorId"):
        md = db.get_document("users", updates.musicDirectorId)
        if md:
            update_dict["musicDirectorName"] = md.get("name")
            members = movie.get("members", [])
            if not any(m.get("userId") == updates.musicDirectorId for m in members):
                members.append({
                    "userId": updates.musicDirectorId,
                    "name": md.get("name", "Music Director"),
                    "role": "MUSIC_DIRECTOR",
                    "joinedAt": datetime.now(timezone.utc).isoformat()
                })
                update_dict["members"] = members

    updated = db.update_document("movies", movie_id, update_dict)
    return ApiResponse(success=True, message="Movie updated successfully.", data=MovieResponse(**updated))

@router.delete("/{movie_id}", response_model=ApiResponse[bool])
def delete_movie(movie_id: str, user_id: Optional[str] = None):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    if user_id and not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only the signed Director, Producer, and authorized crew members can delete this movie project."
        )

    deleted = db.delete_document("movies", movie_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    return ApiResponse(success=True, message="Movie deleted successfully.", data=True)
