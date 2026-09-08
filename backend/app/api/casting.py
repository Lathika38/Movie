import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.core.database import db
from app.schemas.casting import CastingRequestCreate, CastingRequestResponse, CastingStatusUpdate
from app.schemas.common import ApiResponse, CastingStatus

router = APIRouter(prefix="/casting", tags=["Casting & Talent Dispatch"])

@router.post("", response_model=ApiResponse[CastingRequestResponse])
def create_casting_request(payload: CastingRequestCreate, director_id: Optional[str] = None):
    movie = db.get_document("movies", payload.movieId)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    actor = db.get_document("users", payload.actorId)
    if not actor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found.")

    dir_id = director_id or movie.get("directorId") or "DIR-001"
    dir_user = db.get_document("users", dir_id)
    director_name = dir_user.get("name", "Film Director") if dir_user else "Director"

    req_id = str(uuid.uuid4())
    req_data = {
        "id": req_id,
        "movieId": payload.movieId,
        "movieTitle": movie.get("title", "Untitled Cinema Project"),
        "actorId": payload.actorId,
        "actorName": actor.get("name", "Actor"),
        "actorEmail": actor.get("email"),
        "directorId": dir_id,
        "directorName": director_name,
        "producerId": movie.get("producerId"),
        "characterId": payload.characterId,
        "characterName": payload.characterName,
        "characterDescription": payload.characterDescription,
        "roleType": payload.roleType,
        "offeredFee": payload.offeredFee,
        "shootingDates": payload.shootingDates,
        "locations": payload.locations,
        "roleRequirements": payload.roleRequirements,
        "message": payload.message or f"We would love for you to play the role of {payload.characterName} in '{movie.get('title')}'.",
        "status": CastingStatus.PENDING,
        "actorResponseNote": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }

    created = db.set_document("castingRequests", req_id, req_data)

    # Update character casting status to PENDING
    db.update_document("characters", payload.characterId, {
        "castingStatus": "PENDING",
        "actorId": payload.actorId,
        "actorName": actor.get("name")
    })

    # Dispatch notification to Actor
    notif_id = str(uuid.uuid4())
    db.set_document("notifications", notif_id, {
        "id": notif_id,
        "userId": payload.actorId,
        "senderId": dir_id,
        "senderName": director_name,
        "senderRole": "DIRECTOR",
        "movieId": payload.movieId,
        "movieTitle": movie.get("title"),
        "type": "CASTING_OFFER",
        "title": f"Casting Offer: {payload.characterName} in '{movie.get('title')}'",
        "message": f"Director {director_name} has offered you the role of {payload.characterName}. Review the details and accept/decline.",
        "actionUrl": "/actor",
        "isRead": False,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })

    return ApiResponse(
        success=True,
        message=f"Casting request sent to {actor.get('name')} for role '{payload.characterName}'.",
        data=CastingRequestResponse(**created)
    )

@router.get("/movie/{movie_id}", response_model=ApiResponse[List[CastingRequestResponse]])
def get_movie_casting_requests(movie_id: str):
    reqs = db.query_collection("castingRequests", filters=[("movieId", "==", movie_id)], order_by="createdAt", descending=True)
    return ApiResponse(success=True, data=[CastingRequestResponse(**r) for r in reqs])

@router.get("/actor/{actor_id}", response_model=ApiResponse[List[CastingRequestResponse]])
def get_actor_casting_requests(actor_id: str):
    reqs = db.query_collection("castingRequests", filters=[("actorId", "==", actor_id)], order_by="createdAt", descending=True)
    return ApiResponse(success=True, data=[CastingRequestResponse(**r) for r in reqs])

@router.patch("/{request_id}/respond", response_model=ApiResponse[CastingRequestResponse])
def respond_to_casting_request(request_id: str, payload: CastingStatusUpdate):
    req = db.get_document("castingRequests", request_id)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casting request not found.")

    updates = {
        "status": payload.status,
        "actorResponseNote": payload.actorResponseNote,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    updated_req = db.update_document("castingRequests", request_id, updates)

    movie_id = req.get("movieId")
    character_id = req.get("characterId")
    actor_id = req.get("actorId")
    actor_name = req.get("actorName", "Actor")

    if payload.status == CastingStatus.ACCEPTED:
        # 1. Update Character status in Firestore
        db.update_document("characters", character_id, {
            "castingStatus": "CAST",
            "actorId": actor_id,
            "actorName": actor_name
        })

        # 2. Add Actor to Movie members
        movie = db.get_document("movies", movie_id)
        if movie:
            members = movie.get("members", [])
            if not any(m.get("userId") == actor_id for m in members):
                members.append({
                    "userId": actor_id,
                    "name": actor_name,
                    "role": "ACTOR",
                    "characterName": req.get("characterName"),
                    "joinedAt": datetime.now(timezone.utc).isoformat()
                })
                db.update_document("movies", movie_id, {"members": members})

        # 3. Add to Actor's Filmography in Firestore
        actor = db.get_document("users", actor_id)
        if actor:
            filmography = actor.get("filmography", [])
            if not any(f.get("movieId") == movie_id for f in filmography):
                filmography.append({
                    "movieId": movie_id,
                    "movieTitle": req.get("movieTitle", "Movie"),
                    "releaseYear": datetime.now().year,
                    "characterName": req.get("characterName", ""),
                    "roleType": req.get("roleType", "Lead"),
                    "genre": movie.get("genre", "Cinema") if movie else "Cinema",
                    "directorName": req.get("directorName"),
                    "status": "In Production"
                })
                db.update_document("users", actor_id, {"filmography": filmography})

        # 4. Notify Director & Producer
        notif_id = str(uuid.uuid4())
        db.set_document("notifications", notif_id, {
            "id": notif_id,
            "userId": req.get("directorId"),
            "senderId": actor_id,
            "senderName": actor_name,
            "senderRole": "ACTOR",
            "movieId": movie_id,
            "movieTitle": req.get("movieTitle"),
            "type": "CASTING_RESPONSE",
            "title": f"Casting Accepted: {actor_name} is now {req.get('characterName')}!",
            "message": f"{actor_name} has accepted the casting offer for {req.get('characterName')}.",
            "actionUrl": "/director",
            "isRead": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })

        if req.get("producerId") and req.get("producerId") != req.get("directorId"):
            prod_notif_id = str(uuid.uuid4())
            db.set_document("notifications", prod_notif_id, {
                "id": prod_notif_id,
                "userId": req.get("producerId"),
                "senderId": actor_id,
                "senderName": actor_name,
                "senderRole": "ACTOR",
                "movieId": movie_id,
                "movieTitle": req.get("movieTitle"),
                "type": "CASTING_RESPONSE",
                "title": f"Cast Update: {actor_name} joined '{req.get('movieTitle')}'",
                "message": f"{actor_name} has been cast as {req.get('characterName')}.",
                "actionUrl": "/producer",
                "isRead": False,
                "createdAt": datetime.now(timezone.utc).isoformat()
            })
    elif payload.status == CastingStatus.DECLINED:
        db.update_document("characters", character_id, {
            "castingStatus": "UNASSIGNED",
            "actorId": None,
            "actorName": None
        })

    return ApiResponse(
        success=True,
        message=f"Casting request marked as {payload.status}.",
        data=CastingRequestResponse(**updated_req)
    )

@router.get("/suggest-talents-dataset", response_model=ApiResponse[List[dict]])
def get_actor_actress_dataset_suggestions(
    genre: str = "Drama",
    role_type: str = "ALL",
    region: str = "PAN_INDIA"
):
    from app.agents.gemini_service import gemini_service
    dataset = gemini_service.search_actor_actress_dataset(genre=genre, role_type=role_type, region=region)
    return ApiResponse(success=True, message="Actor & Actress casting suggestions retrieved from IMDb/TMDb dataset.", data=dataset)

