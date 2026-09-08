from typing import List, Optional
from pydantic import BaseModel
from app.schemas.common import CastingStatus

class CastingRequestCreate(BaseModel):
    movieId: str
    actorId: str
    characterId: str
    characterName: str
    characterDescription: str
    roleType: str = "Lead"
    offeredFee: Optional[float] = None
    shootingDates: Optional[str] = None
    locations: Optional[str] = None
    roleRequirements: Optional[str] = None
    message: Optional[str] = None

class CastingStatusUpdate(BaseModel):
    status: CastingStatus
    actorResponseNote: Optional[str] = None

class CastingRequestResponse(BaseModel):
    id: str
    movieId: str
    movieTitle: str
    actorId: str
    actorName: str
    actorEmail: Optional[str] = None
    directorId: str
    directorName: str
    producerId: Optional[str] = None
    characterId: str
    characterName: str
    characterDescription: str
    roleType: str
    offeredFee: Optional[float] = None
    shootingDates: Optional[str] = None
    locations: Optional[str] = None
    roleRequirements: Optional[str] = None
    message: Optional[str] = None
    status: CastingStatus
    actorResponseNote: Optional[str] = None
    createdAt: str
    updatedAt: str
