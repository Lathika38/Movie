from typing import List, Optional
from pydantic import BaseModel

class CharacterSchema(BaseModel):
    id: Optional[str] = None
    movieId: str
    name: str
    roleType: str = "Supporting" # Lead, Supporting, Cameo
    age: Optional[str] = None
    gender: Optional[str] = None
    description: str
    personalityTraits: Optional[List[str]] = []
    actorId: Optional[str] = None
    actorName: Optional[str] = None
    castingStatus: Optional[str] = "UNASSIGNED" # UNASSIGNED, PENDING, CAST
    sceneCount: Optional[int] = 0
    scenesAppearedIn: Optional[List[int]] = []
    emotionalArc: Optional[str] = None
    costumeNotes: Optional[str] = None

class SceneSchema(BaseModel):
    id: Optional[str] = None
    movieId: str
    sceneNumber: int
    heading: str # INT. CYBERPUNK ALLEYWAY - NIGHT
    setting: str # INT / EXT
    timeOfDay: str # DAY / NIGHT / DUSK / DAWN
    location: str # Warehouse, Alleyway, Rooftop
    synopsis: str
    characters: List[str] = [] # Names of characters present
    dialogueCount: Optional[int] = 0
    keyDialogueSnippet: Optional[str] = None
    fullScriptText: Optional[str] = None
    emotionalTone: str # Tense, Melancholic, Energetic, Romantic, Suspenseful
    props: Optional[List[str]] = []
    costumes: Optional[List[str]] = []
    vfxNotes: Optional[str] = None
    musicCue: Optional[str] = None
    status: str = "PLANNED" # PLANNED, IN_PROGRESS, SHOT, POST_PRODUCTION
    scheduledDate: Optional[str] = None
    shootingDurationHours: Optional[float] = 2.0
    shotListSuggestions: Optional[List[str]] = []

class ScriptAnalysisResponse(BaseModel):
    movieId: str
    title: str
    logline: Optional[str] = None
    summary: str
    genre: str
    scenes: List[SceneSchema]
    characters: List[CharacterSchema]
    themes: Optional[List[str]] = []
    productionComplexity: Optional[str] = "Medium"
    estimatedShootingDays: Optional[int] = 30
    recommendedLocations: Optional[List[str]] = []

class ScriptUploadRequest(BaseModel):
    movieId: str
    scriptContent: str
    version: Optional[str] = "v1.0"
