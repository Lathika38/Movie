from typing import List, Optional, Any
from pydantic import BaseModel, field_validator
from app.schemas.common import MovieStatus

class MovieMember(BaseModel):
    userId: str
    name: str
    role: str
    characterName: Optional[str] = None
    joinedAt: Optional[str] = None

class MovieCreate(BaseModel):
    title: str
    genre: Optional[str] = 'Drama'
    language: Optional[str] = 'English'
    logline: Optional[str] = 'A cinematic production.'
    synopsis: Optional[str] = ''
    producerId: Optional[str] = None
    directorId: Optional[str] = None
    musicDirectorId: Optional[str] = None
    createdBy: Optional[str] = None
    status: Optional[Any] = 'DEVELOPMENT'
    budget: Optional[Any] = 0.0
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    releaseDate: Optional[str] = None
    posterUrl: Optional[str] = None
    targetAudience: Optional[str] = None
    productionCompany: Optional[str] = None

    @field_validator('budget', mode='before')
    @classmethod
    def parse_budget(cls, v):
        if v is None or v == '':
            return 0.0
        try:
            return float(str(v).replace('$', '').replace(',', '').strip())
        except Exception:
            return 0.0

    @field_validator('genre', mode='before')
    @classmethod
    def parse_genre(cls, v):
        return v if v and str(v).strip() else 'Drama'

    @field_validator('logline', mode='before')
    @classmethod
    def parse_logline(cls, v):
        return v if v and str(v).strip() else 'A cinematic production.'

    @field_validator('status', mode='before')
    @classmethod
    def parse_status(cls, v):
        if isinstance(v, MovieStatus):
            return v
        if not v:
            return MovieStatus.DEVELOPMENT
        s_upper = str(v).upper().replace(' ', '_')
        for st in MovieStatus:
            if st.value == s_upper or st.name == s_upper:
                return st
        return MovieStatus.DEVELOPMENT

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
    status: Optional[Any] = None
    budget: Optional[Any] = None
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
    synopsis: Optional[str] = ''
    producerId: Optional[str] = None
    producerName: Optional[str] = None
    directorId: Optional[str] = None
    directorName: Optional[str] = None
    musicDirectorId: Optional[str] = None
    musicDirectorName: Optional[str] = None
    createdBy: Optional[str] = None
    status: Any = 'DEVELOPMENT'
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
