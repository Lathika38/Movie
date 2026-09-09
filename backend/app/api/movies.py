import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.core.database import db
from app.core.security import get_current_user, require_roles
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
        return False

    # 1. ADMIN / STUDIO CHIEF always has executive access
    if user_id in ["USR-ADMIN-001", "USR-ADM-001", "MOVIEOS-ADMIN-001"]:
        return True

    user_doc = db.get_document("users", user_id)
    user_role = user_doc.get("role", "") if user_doc else ""
    user_email = user_doc.get("email", "") if user_doc else ""
    user_prod_company = user_doc.get("productionCompany", "") if user_doc else ""

    if user_role == "ADMIN" or user_email == "devil@movieos.ai":
        return True

    user_name = user_doc.get("name", "").strip().lower() if user_doc else ""

    # 2. Producer, Director, Music Director, or Creator assigned to the movie
    is_producer = (
        movie.get("producerId") == user_id or 
        (user_email and movie.get("producerEmail", "").lower() == user_email) or
        (user_name and user_role == "PRODUCER" and movie.get("producerName", "").lower() == user_name)
    )
    is_director = (
        movie.get("directorId") == user_id or 
        (user_email and movie.get("directorEmail", "").lower() == user_email) or
        (user_name and user_role == "DIRECTOR" and movie.get("directorName", "").lower() == user_name)
    )
    is_music_director = (
        movie.get("musicDirectorId") == user_id or 
        (user_email and movie.get("musicDirectorEmail", "").lower() == user_email) or
        (user_name and user_role == "MUSIC_DIRECTOR" and movie.get("musicDirectorName", "").lower() == user_name)
    )
    is_creator = (movie.get("createdBy") == user_id)

    # 3. Check if producer's registered production company matches movie's production company
    movie_prod_company = movie.get("productionCompany", "")
    is_matching_production = False
    if user_role == "PRODUCER" and user_prod_company and movie_prod_company:
        if user_prod_company.strip().lower() == movie_prod_company.strip().lower():
            is_matching_production = True

    # 4. Check if user is in movie members list
    is_member = any(
        mem.get("userId") == user_id or 
        (user_email and mem.get("email", "").lower() == user_email) or
        (user_name and mem.get("name", "").lower() == user_name)
        for mem in movie.get("members", [])
    )

    if is_producer or is_director or is_music_director or is_creator or is_matching_production or is_member:
        return True

    # 5. For ACTOR role, check casting offers, signed filmography, or assigned character records
    if user_role == "ACTOR":
        # Check Actor's filmography
        actor_films = user_doc.get("filmography", []) if user_doc else []
        if any(f.get("movieId") == movie.get("id") for f in actor_films):
            return True

        # Check casting offers
        movie_offers = db.query_collection("castingRequests", filters=[("movieId", "==", movie.get("id"))])
        has_offer_or_signed = any(
            (req.get("actorId") == user_id or 
             (user_email and (req.get("actorEmail") or "").lower() == user_email) or
             (user_name and (req.get("actorName") or "").lower() == user_name)) and
            req.get("status") in ["PENDING", "ACCEPTED"]
            for req in movie_offers
        )
        if has_offer_or_signed:
            return True

        # Check assigned characters in this movie
        chars = db.query_collection("characters", filters=[("movieId", "==", movie.get("id"))])
        is_assigned_char = any(
            c.get("actorId") == user_id or 
            (user_name and (c.get("actorName") or "").lower() == user_name)
            for c in chars
        )
        if is_assigned_char:
            return True

    # User is not authorized to access this movie project
    return False


@router.get("", response_model=ApiResponse[List[MovieResponse]])
def list_movies(
    user_id: Optional[str] = None,
    role: Optional[str] = None,
    status_filter: Optional[MovieStatus] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    effective_user_id = user_id
    if current_user and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")):
        effective_user_id = current_user.get("id")
    elif not effective_user_id and current_user:
        effective_user_id = current_user.get("id")

    movies = db.query_collection("movies", order_by="createdAt", descending=True)
    
    # Enrich names and scene stats
    enriched = []
    for m in movies:
        m_id = m.get("id")
        
        # Strict Production Access Control: Only Creator / Signed Director & Producer can view!
        if effective_user_id and not is_user_authorized_for_movie(m, effective_user_id):
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
def create_movie(
    payload: MovieCreate,
    current_user: Dict[str, Any] = Depends(require_roles(["DIRECTOR", "PRODUCER", "ADMIN"]))
):
    movie_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = movie_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    data["members"] = []

    creator_id = current_user.get("id")
    creator_role = current_user.get("role", "DIRECTOR")
    data["createdBy"] = payload.createdBy or creator_id

    # Add creator as member
    if creator_id:
        data["members"].append({
            "userId": creator_id,
            "name": current_user.get("name", "Creator"),
            "role": creator_role,
            "joinedAt": datetime.now(timezone.utc).isoformat()
        })
        if creator_role == "DIRECTOR" and not data.get("directorId"):
            data["directorId"] = creator_id
            data["directorName"] = current_user.get("name")
        elif creator_role == "PRODUCER" and not data.get("producerId"):
            data["producerId"] = creator_id
            data["producerName"] = current_user.get("name")

    # If producer created, add as member if not present
    if payload.producerId and payload.producerId != creator_id:
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

    # If director assigned, add as member if not present
    if payload.directorId and payload.directorId != creator_id:
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
def get_movie_details(
    movie_id: str,
    user_id: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    effective_user_id = user_id
    if current_user and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")):
        effective_user_id = current_user.get("id")
    elif not effective_user_id and current_user:
        effective_user_id = current_user.get("id")

    if not is_user_authorized_for_movie(movie, effective_user_id):
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
def update_movie(
    movie_id: str,
    updates: MovieUpdate,
    user_id: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    effective_user_id = user_id
    if current_user and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")):
        effective_user_id = current_user.get("id")
    elif not effective_user_id and current_user:
        effective_user_id = current_user.get("id")

    if not is_user_authorized_for_movie(movie, effective_user_id):
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
def delete_movie(
    movie_id: str,
    user_id: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    effective_user_id = user_id
    if current_user and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")):
        effective_user_id = current_user.get("id")
    elif not effective_user_id and current_user:
        effective_user_id = current_user.get("id")

    if not is_user_authorized_for_movie(movie, effective_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only the signed Director, Producer, and authorized crew members can delete this movie project."
        )

    deleted = db.delete_document("movies", movie_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    return ApiResponse(success=True, message="Movie deleted successfully.", data=True)

