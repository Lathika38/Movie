import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import db
from app.core.security import get_current_user
from app.api.movies import is_user_authorized_for_movie
from app.schemas.notification import (
    NotificationCreate, NotificationResponse, BroadcastAnnouncement, MessageCreate, MessageResponse
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/notifications", tags=["Notifications & Real-time Alerts"])

@router.get("/user/{user_id}", response_model=ApiResponse[List[NotificationResponse]])
def get_user_notifications(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    target_id = current_user.get("id") if current_user and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")) else user_id
    notifs = db.query_collection("notifications", filters=[("userId", "==", target_id)], order_by="createdAt", descending=True)
    return ApiResponse(success=True, data=[NotificationResponse(**n) for n in notifs])

@router.patch("/{notif_id}/read", response_model=ApiResponse[bool])
def mark_notification_read(
    notif_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    notif = db.get_document("notifications", notif_id)
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    if notif.get("userId") != current_user.get("id") and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    updated = db.update_document("notifications", notif_id, {"isRead": True})
    return ApiResponse(success=True, message="Marked as read.", data=True)

@router.post("/send", response_model=ApiResponse[NotificationResponse])
def send_notification(
    payload: NotificationCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    notif_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = notif_id
    data["isRead"] = False
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("notifications", notif_id, data)
    return ApiResponse(success=True, message="Notification sent.", data=NotificationResponse(**created))

@router.post("/broadcast", response_model=ApiResponse[int])
def broadcast_crew_announcement(
    payload: BroadcastAnnouncement,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = db.get_document("movies", payload.movieId)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    if not is_user_authorized_for_movie(movie, current_user.get("id")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You are not an authorized member of this project workspace.")

    all_users = db.query_collection("users")
    recipients = []
    for u in all_users:
        if u.get("id") == current_user.get("id"):
            continue
        if payload.targetRole != "ALL" and u.get("role") != payload.targetRole:
            continue
        recipients.append(u)

    count = 0
    for r in recipients:
        notif_id = str(uuid.uuid4())
        record = {
            "id": notif_id,
            "userId": r["id"],
            "senderId": current_user.get("id"),
            "senderName": current_user.get("name", payload.senderName),
            "senderRole": current_user.get("role", payload.senderRole),
            "movieId": payload.movieId,
            "movieTitle": movie.get("title", "Cinema Production"),
            "type": "ANNOUNCEMENT",
            "title": f"📢 Crew Instruction from {str(current_user.get('role', 'Director')).title()}: {payload.title}",
            "message": payload.message,
            "isRead": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        db.set_document("notifications", notif_id, record)
        count += 1

    return ApiResponse(
        success=True,
        message=f"Announcement broadcasted to {count} crew member(s).",
        data=count
    )

# -------------------------------------------------------------
# MESSAGING / PRODUCTION LOG CHANNELS
# -------------------------------------------------------------
@router.get("/messages/{movie_id}", response_model=ApiResponse[List[MessageResponse]])
def get_movie_messages(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    if not is_user_authorized_for_movie(movie, current_user.get("id")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You are not authorized for this movie workspace.")

    messages = db.query_collection("messages", filters=[("movieId", "==", movie_id)], order_by="createdAt")
    return ApiResponse(success=True, data=[MessageResponse(**m) for m in messages])

@router.post("/messages", response_model=ApiResponse[MessageResponse])
def send_movie_message(
    payload: MessageCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = db.get_document("movies", payload.movieId)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    if not is_user_authorized_for_movie(movie, current_user.get("id")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You are not authorized for this movie workspace.")

    msg_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = msg_id
    data["senderId"] = current_user.get("id")
    data["senderName"] = current_user.get("name", payload.senderName)
    data["senderRole"] = current_user.get("role", payload.senderRole)
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("messages", msg_id, data)
    return ApiResponse(success=True, message="Message posted.", data=MessageResponse(**created))

