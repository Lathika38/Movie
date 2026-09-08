import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.core.database import db
from app.schemas.notification import (
    NotificationCreate, NotificationResponse, BroadcastAnnouncement, MessageCreate, MessageResponse
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/notifications", tags=["Notifications & Real-time Alerts"])

@router.get("/user/{user_id}", response_model=ApiResponse[List[NotificationResponse]])
def get_user_notifications(user_id: str):
    notifs = db.query_collection("notifications", filters=[("userId", "==", user_id)], order_by="createdAt", descending=True)
    return ApiResponse(success=True, data=[NotificationResponse(**n) for n in notifs])

@router.patch("/{notif_id}/read", response_model=ApiResponse[bool])
def mark_notification_read(notif_id: str):
    updated = db.update_document("notifications", notif_id, {"isRead": True})
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return ApiResponse(success=True, message="Marked as read.", data=True)

@router.post("/send", response_model=ApiResponse[NotificationResponse])
def send_notification(payload: NotificationCreate):
    notif_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = notif_id
    data["isRead"] = False
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("notifications", notif_id, data)
    return ApiResponse(success=True, message="Notification sent.", data=NotificationResponse(**created))

@router.post("/broadcast", response_model=ApiResponse[int])
def broadcast_crew_announcement(payload: BroadcastAnnouncement):
    movie = db.get_document("movies", payload.movieId)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    all_users = db.query_collection("users")
    recipients = []
    for u in all_users:
        if u.get("id") == payload.senderId:
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
            "senderId": payload.senderId,
            "senderName": payload.senderName,
            "senderRole": payload.senderRole,
            "movieId": payload.movieId,
            "movieTitle": movie.get("title", "Cinema Production"),
            "type": "ANNOUNCEMENT",
            "title": f"📢 Crew Instruction from {payload.senderRole.title()}: {payload.title}",
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
def get_movie_messages(movie_id: str):
    messages = db.query_collection("messages", filters=[("movieId", "==", movie_id)], order_by="createdAt")
    return ApiResponse(success=True, data=[MessageResponse(**m) for m in messages])

@router.post("/messages", response_model=ApiResponse[MessageResponse])
def send_movie_message(payload: MessageCreate):
    msg_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = msg_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("messages", msg_id, data)
    return ApiResponse(success=True, message="Message posted.", data=MessageResponse(**created))
