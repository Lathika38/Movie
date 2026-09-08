from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class DirectorAiRequest(BaseModel):
    movieId: str
    prompt: str
    sceneId: Optional[str] = None
    characterId: Optional[str] = None
    contextType: Optional[str] = "GENERAL" # SCRIPT_ANALYSIS, SHOT_SUGGESTION, EMOTIONAL_ARC, CASTING_ADVICE, SCENE_NOTES

class ProducerAiRequest(BaseModel):
    movieId: str
    prompt: str
    includeWeatherAnalysis: Optional[bool] = True
    contextType: Optional[str] = "SCHEDULE_RISK" # SCHEDULE_RISK, BUDGET_FORECAST, DEPARTMENT_HEALTH, WEATHER_CONTINGENCY

class ActorAiRequest(BaseModel):
    movieId: str
    characterId: str
    sceneId: Optional[str] = None
    prompt: str
    contextType: Optional[str] = "SUBTEXT_ANALYSIS" # SUBTEXT_ANALYSIS, EMOTIONAL_PREPARATION, LINE_REHEARSAL, MOTIVATION_COACH

class MusicAiRequest(BaseModel):
    movieId: str
    sceneNumber: Optional[int] = None
    characterName: Optional[str] = None
    prompt: str
    contextType: Optional[str] = "SCORE_DIRECTION" # SCORE_DIRECTION, THEME_DESIGN, TEMPO_INSTRUMENT_SUGGESTION, CULTURAL_RESEARCH

class AgentResponse(BaseModel):
    agentRole: str
    title: str
    analysis: str
    structuredInsights: Optional[Dict[str, Any]] = {}
    recommendations: List[str] = []
    confidenceScore: Optional[float] = 0.95
    suggestedActions: Optional[List[Dict[str, str]]] = []
