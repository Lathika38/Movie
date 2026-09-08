from typing import Optional
from pydantic import BaseModel

class NotificationCreate(BaseModel):
    userId: str # Recipient
    senderId: Optional[str] = "SYSTEM"
    senderName: Optional[str] = "MovieOS System"
    senderRole: Optional[str] = "SYSTEM"
    movieId: Optional[str] = None
    movieTitle: Optional[str] = None
    type: str # CASTING_OFFER, CASTING_RESPONSE, SCHEDULE_UPDATE, MUSIC_SUBMISSION, MUSIC_REVIEW, RISK_ALERT, GENERAL
    title: str
    message: str
    actionUrl: Optional[str] = None
    metadata: Optional[dict] = {}

class NotificationResponse(NotificationCreate):
    id: str
    isRead: bool = False
    createdAt: str

class BroadcastAnnouncement(BaseModel):
    movieId: str
    senderId: str
    senderName: str
    senderRole: str
    targetRole: Optional[str] = "ALL"
    title: str
    message: str

class MessageCreate(BaseModel):
    movieId: str
    senderId: str
    senderName: str
    senderRole: str
    recipientId: Optional[str] = None # None means public movie channel
    content: str

class MessageResponse(MessageCreate):
    id: str
    createdAt: str
