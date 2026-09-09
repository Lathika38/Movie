import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import db
from app.core.security import get_current_user
from app.api.movies import is_user_authorized_for_movie
from app.schemas.music import (
    MusicTrackCreate, MusicTrackResponse,
    MusicThemeCreate, MusicThemeResponse,
    MusicProjectCreate, MusicProjectResponse,
    MusicReviewSubmit
)
from app.schemas.common import ApiResponse, TrackStatus

router = APIRouter(prefix="/music", tags=["Music Director & Sonic Studio"])

def _check_music_movie_access(movie_id: str, user: Optional[Dict[str, Any]]):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    user_id = user.get("id") if user else None
    if not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only authorized production workspace members can access or modify soundtrack assets."
        )
    return movie

# -------------------------------------------------------------
# MUSIC PROJECTS
# -------------------------------------------------------------
@router.get("/projects/{movie_id}", response_model=ApiResponse[Optional[MusicProjectResponse]])
def get_music_project(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_music_movie_access(movie_id, current_user)
    projects = db.query_collection("musicProjects", filters=[("movieId", "==", movie_id)])
    if not projects:
        proj_id = str(uuid.uuid4())
        proj_data = {
            "id": proj_id,
            "movieId": movie_id,
            "musicDirectorId": movie.get("musicDirectorId") or current_user.get("id"),
            "overview": f"Master Original Motion Picture Soundtrack & Soundscape for '{movie.get('title')}'.",
            "sonicPalette": "Hybrid Symphonic Orchestra with Granular Analog Modular Synthesis",
            "targetDeliveryDate": movie.get("releaseDate") or "2026-12-01",
            "totalCues": 0,
            "approvedCues": 0,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
        created = db.set_document("musicProjects", proj_id, proj_data)
        return ApiResponse(success=True, data=MusicProjectResponse(**created))

    proj = projects[0]
    tracks = db.query_collection("musicTracks", filters=[("movieId", "==", movie_id)])
    proj["totalCues"] = len(tracks)
    proj["approvedCues"] = len([t for t in tracks if t.get("status") == "APPROVED"])
    return ApiResponse(success=True, data=MusicProjectResponse(**proj))

@router.post("/projects", response_model=ApiResponse[MusicProjectResponse])
def create_music_project(
    payload: MusicProjectCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_music_movie_access(payload.movieId, current_user)
    proj_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = proj_id
    data["totalCues"] = 0
    data["approvedCues"] = 0
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("musicProjects", proj_id, data)
    return ApiResponse(success=True, message="Music project created.", data=MusicProjectResponse(**created))

# -------------------------------------------------------------
# TRACKS & CUES
# -------------------------------------------------------------
@router.get("/tracks/{movie_id}", response_model=ApiResponse[List[MusicTrackResponse]])
def get_movie_tracks(
    movie_id: str,
    track_type: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_music_movie_access(movie_id, current_user)
    tracks = db.query_collection("musicTracks", filters=[("movieId", "==", movie_id)], order_by="createdAt", descending=True)
    if track_type:
        tracks = [t for t in tracks if t.get("trackType") == track_type.upper()]
    return ApiResponse(success=True, data=[MusicTrackResponse(**t) for t in tracks])

@router.post("/tracks", response_model=ApiResponse[MusicTrackResponse])
def create_music_track(
    payload: MusicTrackCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_music_movie_access(payload.movieId, current_user)
    track_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = track_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    if not data.get("waveformPeaks"):
        data["waveformPeaks"] = [0.2, 0.4, 0.7, 0.85, 0.9, 0.65, 0.5, 0.8, 0.95, 0.75, 0.6, 0.4, 0.3, 0.6, 0.85, 0.5]

    created = db.set_document("musicTracks", track_id, data)
    return ApiResponse(success=True, message=f"Track '{payload.title}' added to soundtrack library.", data=MusicTrackResponse(**created))

@router.put("/tracks/{track_id}", response_model=ApiResponse[MusicTrackResponse])
def update_music_track(
    track_id: str,
    updates: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    track = db.get_document("musicTracks", track_id)
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")
    _check_music_movie_access(track.get("movieId"), current_user)

    updated = db.update_document("musicTracks", track_id, updates)
    return ApiResponse(success=True, message="Track updated.", data=MusicTrackResponse(**updated))

@router.delete("/tracks/{track_id}", response_model=ApiResponse[bool])
def delete_music_track(
    track_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    track = db.get_document("musicTracks", track_id)
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")
    _check_music_movie_access(track.get("movieId"), current_user)

    deleted = db.delete_document("musicTracks", track_id)
    return ApiResponse(success=True, message="Track deleted from soundtrack library.", data=True)

@router.post("/tracks/{track_id}/submit-review", response_model=ApiResponse[MusicTrackResponse])
def submit_track_for_review(
    track_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    track = db.get_document("musicTracks", track_id)
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")
    _check_music_movie_access(track.get("movieId"), current_user)

    updates = {
        "status": TrackStatus.SUBMITTED,
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }
    updated = db.update_document("musicTracks", track_id, updates)

    # Notify Director
    movie = db.get_document("movies", track.get("movieId"))
    if movie and movie.get("directorId"):
        notif_id = str(uuid.uuid4())
        db.set_document("notifications", notif_id, {
            "id": notif_id,
            "userId": movie["directorId"],
            "senderId": current_user.get("id"),
            "senderName": current_user.get("name", "Music Director"),
            "senderRole": "MUSIC_DIRECTOR",
            "movieId": track.get("movieId"),
            "movieTitle": movie.get("title"),
            "type": "MUSIC_SUBMISSION",
            "title": f"Music Review Request: '{track.get('title')}'",
            "message": f"New soundtrack cue '{track.get('title')}' ({track.get('mood')}) submitted for your directorial review.",
            "actionUrl": "/director",
            "isRead": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })

    return ApiResponse(success=True, message="Track submitted to Director for review.", data=MusicTrackResponse(**updated))

@router.post("/tracks/review", response_model=ApiResponse[MusicTrackResponse])
def review_music_track(
    payload: MusicReviewSubmit,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    track = db.get_document("musicTracks", payload.trackId)
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")
    _check_music_movie_access(track.get("movieId"), current_user)

    updates = {
        "status": payload.status,
        "directorFeedback": payload.feedback,
        "directorRating": payload.rating,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    updated = db.update_document("musicTracks", payload.trackId, updates)

    # Notify Music Director
    movie = db.get_document("movies", track.get("movieId"))
    if movie and movie.get("musicDirectorId"):
        notif_id = str(uuid.uuid4())
        status_label = "Approved! 🎉" if payload.status == TrackStatus.APPROVED else "Revision Requested"
        db.set_document("notifications", notif_id, {
            "id": notif_id,
            "userId": movie["musicDirectorId"],
            "senderId": current_user.get("id"),
            "senderName": current_user.get("name", "Director"),
            "senderRole": "DIRECTOR",
            "movieId": track.get("movieId"),
            "movieTitle": movie.get("title"),
            "type": "MUSIC_REVIEW",
            "title": f"Score Feedback: '{track.get('title')}' - {status_label}",
            "message": f"Director Note: {payload.feedback}",
            "actionUrl": "/music-director",
            "isRead": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })

    return ApiResponse(success=True, message=f"Track marked as {payload.status}.", data=MusicTrackResponse(**updated))

# -------------------------------------------------------------
# CHARACTER THEMES
# -------------------------------------------------------------
@router.get("/themes/{movie_id}", response_model=ApiResponse[List[MusicThemeResponse]])
def get_movie_themes(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_music_movie_access(movie_id, current_user)
    themes = db.query_collection("musicThemes", filters=[("movieId", "==", movie_id)])
    return ApiResponse(success=True, data=[MusicThemeResponse(**t) for t in themes])

@router.post("/themes", response_model=ApiResponse[MusicThemeResponse])
def create_music_theme(
    payload: MusicThemeCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_music_movie_access(payload.movieId, current_user)
    theme_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = theme_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("musicThemes", theme_id, data)
    return ApiResponse(success=True, message="Character theme leitmotif created.", data=MusicThemeResponse(**created))

