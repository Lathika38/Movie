from typing import List, Optional
from pydantic import BaseModel
from app.schemas.common import MovieStatus

class MovieMember(BaseModel):
    userId: str
    name: str
    role: str # DIRECTOR, PRODUCER, ACTOR, MUSIC_DIRECTOR
    characterName: Optional[str] = None
    joinedAt: Optional[str] = None

class MovieCreate(BaseModel):
    title: str
    genre: str
    language: str
    logline: str
    synopsis: Optional[str] = ""
    producerId: Optional[str] = None
    directorId: Optional[str] = None
    musicDirectorId: Optional[str] = None
    createdBy: Optional[str] = None
    status: Optional[MovieStatus] = MovieStatus.DEVELOPMENT
    budget: Optional[float] = 0.0
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    releaseDate: Optional[str] = None
    posterUrl: Optional[str] = None
    targetAudience: Optional[str] = None
    productionCompany: Optional[str] = None

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    logline: Optional[str] = None
    synopsis: Optional[str] = None
    producerId: Optional[str] = None
    directorId: Optional[str] = None
    musicDirectorId: Optional[str] = None
    createdBy: Optional[str] = None
    status: Optional[MovieStatus] = None
    budget: Optional[float] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    releaseDate: Optional[str] = None
    posterUrl: Optional[str] = None
    targetAudience: Optional[str] = None
    productionCompany: Optional[str] = None

class MovieResponse(BaseModel):
    id: str
    title: str
    genre: str
    language: str
    logline: str
    synopsis: Optional[str] = ""
    producerId: Optional[str] = None
    producerName: Optional[str] = None
    directorId: Optional[str] = None
    directorName: Optional[str] = None
    musicDirectorId: Optional[str] = None
    musicDirectorName: Optional[str] = None
    createdBy: Optional[str] = None
    status: MovieStatus
    budget: float = 0.0
    spentBudget: Optional[float] = 0.0
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    releaseDate: Optional[str] = None
    posterUrl: Optional[str] = None
    targetAudience: Optional[str] = None
    productionCompany: Optional[str] = None
    members: Optional[List[MovieMember]] = []
    totalScenes: Optional[int] = 0
    completedScenes: Optional[int] = 0
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
