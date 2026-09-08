from typing import List, Optional
from pydantic import BaseModel
from app.schemas.common import TrackStatus

class MusicTrackCreate(BaseModel):
    movieId: str
    musicProjectId: Optional[str] = None
    title: str
    trackType: str # THEME, BGM, SONG, TEASER, SOUND_DESIGN
    sceneNumber: Optional[int] = None
    characterName: Optional[str] = None
    mood: str # Ethereal, Tense, Heroic, Melancholic, Action, Romantic
    bpm: Optional[int] = 120
    keySignature: Optional[str] = "C Minor"
    durationSeconds: Optional[int] = 180
    audioUrl: Optional[str] = None
    waveformPeaks: Optional[List[float]] = []
    instrumentsUsed: Optional[List[str]] = []
    notes: Optional[str] = None
    status: TrackStatus = TrackStatus.DRAFT

class MusicTrackResponse(MusicTrackCreate):
    id: str
    directorFeedback: Optional[str] = None
    directorRating: Optional[int] = None
    submittedAt: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class MusicThemeCreate(BaseModel):
    movieId: str
    name: str # e.g. "Protagonist Leitmotif", "Antagonist Descent"
    characterName: Optional[str] = None
    concept: str
    primaryInstruments: List[str] = []
    scaleOrMode: Optional[str] = "Dorian"
    tempoRange: Optional[str] = "90-110 BPM"
    audioSnippetUrl: Optional[str] = None

class MusicThemeResponse(MusicThemeCreate):
    id: str
    createdAt: Optional[str] = None

class MusicProjectCreate(BaseModel):
    movieId: str
    musicDirectorId: str
    overview: str
    sonicPalette: Optional[str] = None
    targetDeliveryDate: Optional[str] = None

class MusicProjectResponse(MusicProjectCreate):
    id: str
    totalCues: int = 0
    approvedCues: int = 0
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class MusicReviewSubmit(BaseModel):
    trackId: str
    status: TrackStatus # APPROVED or REVISION_REQUESTED
    feedback: str
    rating: Optional[int] = 5
