import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import db
from app.core.security import get_current_user
from app.api.movies import is_user_authorized_for_movie
from app.schemas.casting import CastingRequestCreate, CastingRequestResponse, CastingStatusUpdate
from app.schemas.common import ApiResponse, CastingStatus

router = APIRouter(prefix="/casting", tags=["Casting & Talent Dispatch"])

def _check_casting_movie_access(movie_id: str, user: Optional[Dict[str, Any]]):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    user_id = user.get("id") if user else None
    if not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only authorized production workspace members can access or create casting requests for this movie project."
        )
    return movie

@router.post("", response_model=ApiResponse[CastingRequestResponse])
def create_casting_request(
    payload: CastingRequestCreate,
    director_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_casting_movie_access(payload.movieId, current_user)

    actor = db.get_document("users", payload.actorId)
    if not actor:
        # Check if actorId matches a user's name or if it's an AI-suggested talent ID/name
        existing_actors = db.query_collection("users", filters=[("role", "==", "ACTOR")])
        matched = next((a for a in existing_actors if a.get("name", "").lower() == payload.actorId.lower() or a.get("id") == payload.actorId), None)
        if matched:
            actor = matched
            payload.actorId = matched["id"]
        else:
            # Auto-provision talent record in database so real-time dispatch always succeeds smoothly
            actor_name = payload.actorId if len(payload.actorId) > 2 and not payload.actorId.startswith("ACT-") else "Featured Performer"
            auto_actor_id = str(uuid.uuid4())
            actor = {
                "id": auto_actor_id,
                "name": actor_name,
                "email": f"{actor_name.lower().replace(' ', '.')}@talent.movieos.cinema",
                "role": "ACTOR",
                "availability": "Available",
                "skills": ["Screen Acting", "Method Acting", "Character Delivery"],
                "genres": ["Drama", "Action", "Thriller", "Art Cinema"],
                "filmography": [],
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            db.set_document("users", auto_actor_id, actor)
            payload.actorId = auto_actor_id

    dir_id = director_id or movie.get("directorId") or current_user.get("id")
    dir_user = db.get_document("users", dir_id)
    director_name = dir_user.get("name", "Film Director") if dir_user else current_user.get("name", "Director")

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
def get_movie_casting_requests(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_casting_movie_access(movie_id, current_user)
    reqs = db.query_collection("castingRequests", filters=[("movieId", "==", movie_id)], order_by="createdAt", descending=True)
    return ApiResponse(success=True, data=[CastingRequestResponse(**r) for r in reqs])

@router.get("/actor/{actor_id}", response_model=ApiResponse[List[CastingRequestResponse]])
def get_actor_casting_requests(
    actor_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user = db.get_document("users", actor_id)
    user_name = user.get("name", "").strip().lower() if user else ""
    user_email = user.get("email", "").strip().lower() if user else ""

    all_reqs = db.query_collection("castingRequests", order_by="createdAt", descending=True)
    matched_reqs = []
    seen_ids = set()

    for r in all_reqs:
        r_id = r.get("id")
        if r_id in seen_ids:
            continue
        
        r_actor_id = r.get("actorId")
        r_actor_email = (r.get("actorEmail") or "").strip().lower()
        r_actor_name = (r.get("actorName") or "").strip().lower()

        if r_actor_id == actor_id or (user_email and r_actor_email == user_email) or (user_name and r_actor_name == user_name):
            seen_ids.add(r_id)
            matched_reqs.append(CastingRequestResponse(**r))

    return ApiResponse(success=True, data=matched_reqs)

@router.patch("/{request_id}/respond", response_model=ApiResponse[CastingRequestResponse])
def respond_to_casting_request(
    request_id: str,
    payload: CastingStatusUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
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
    return ApiResponse(success=True, message="Actor & Actress casting suggestions retrieved from live Google Search & Wikipedia.", data=dataset)


@router.get("/script-matches/{movie_id}", response_model=ApiResponse[List[dict]])
def get_script_character_matches(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_casting_movie_access(movie_id, current_user)

    characters = db.query_collection("characters", filters=[("movieId", "==", movie_id)])
    scenes = db.query_collection("scenes", filters=[("movieId", "==", movie_id)])

    from app.agents.gemini_service import gemini_service
    matches = gemini_service.analyze_script_character_casting(
        movie=movie,
        characters=characters,
        scenes=scenes
    )

    return ApiResponse(
        success=True,
        message=f"Screenplay casting analysis complete for {len(matches)} characters.",
        data=matches
    )


@router.post("/assign-direct", response_model=ApiResponse[dict])
def assign_actor_direct(
    payload: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie_id = payload.get("movieId")
    character_id = payload.get("characterId")
    actor_name = payload.get("actorName")
    actor_id = payload.get("actorId")

    if not movie_id or not character_id or not actor_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="movieId, characterId, and actorName are required.")

    movie = _check_casting_movie_access(movie_id, current_user)

    character = db.get_document("characters", character_id)
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found.")

    # Check or auto-provision actor record
    target_actor_id = actor_id
    if not target_actor_id or not db.get_document("users", target_actor_id):
        existing_actors = db.query_collection("users", filters=[("role", "==", "ACTOR")])
        matched = next((a for a in existing_actors if a.get("name", "").lower() == actor_name.lower()), None)
        if matched:
            target_actor_id = matched["id"]
        else:
            target_actor_id = str(uuid.uuid4())
            new_actor = {
                "id": target_actor_id,
                "name": actor_name,
                "email": f"{actor_name.lower().replace(' ', '.')}@talent.movieos.cinema",
                "role": "ACTOR",
                "availability": "Cast",
                "skills": ["Method Acting", "Character Delivery"],
                "genres": [movie.get("genre", "Drama")],
                "filmography": [],
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            db.set_document("users", target_actor_id, new_actor)

    # 1. Update character castingStatus to CAST
    updated_char = db.update_document("characters", character_id, {
        "castingStatus": "CAST",
        "actorId": target_actor_id,
        "actorName": actor_name,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    })

    # 2. Add member to movie
    members = movie.get("members", [])
    if not any(m.get("userId") == target_actor_id for m in members):
        members.append({
            "userId": target_actor_id,
            "name": actor_name,
            "role": "ACTOR",
            "characterName": character.get("name"),
            "joinedAt": datetime.now(timezone.utc).isoformat()
        })
        db.update_document("movies", movie_id, {"members": members})

    # 3. Add to Actor Filmography
    actor_doc = db.get_document("users", target_actor_id)
    if actor_doc:
        filmography = actor_doc.get("filmography", [])
        if not any(f.get("movieId") == movie_id for f in filmography):
            filmography.append({
                "movieId": movie_id,
                "movieTitle": movie.get("title", "Untitled Project"),
                "releaseYear": datetime.now().year,
                "characterName": character.get("name", ""),
                "roleType": character.get("roleType", "Lead"),
                "genre": movie.get("genre", "Cinema"),
                "directorName": movie.get("directorName", "Director"),
                "status": "In Production"
            })
            db.update_document("users", target_actor_id, {"filmography": filmography, "availability": "Cast"})

    # 4. Dispatch notification to Director
    notif_id = str(uuid.uuid4())
    db.set_document("notifications", notif_id, {
        "id": notif_id,
        "userId": movie.get("directorId") or "DIR-001",
        "senderId": target_actor_id,
        "senderName": actor_name,
        "senderRole": "ACTOR",
        "movieId": movie_id,
        "movieTitle": movie.get("title"),
        "type": "CASTING_ASSIGNED",
        "title": f"Casting Locked: {actor_name} assigned as {character.get('name')}",
        "message": f"{actor_name} has been assigned to the role of {character.get('name')} based on script breakdown.",
        "actionUrl": "/director",
        "isRead": False,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })

    return ApiResponse(
        success=True,
        message=f"{actor_name} successfully assigned to role '{character.get('name')}'.",
        data={"character": updated_char, "actorId": target_actor_id, "actorName": actor_name}
    )


