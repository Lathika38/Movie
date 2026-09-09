import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import db
from app.core.security import get_current_user
from app.api.movies import is_user_authorized_for_movie
from app.agents.role_agents import role_agent_orchestrator
from app.integrations.weather import weather_service
from app.schemas.ai import (
    DirectorAiRequest, ProducerAiRequest, ActorAiRequest, MusicAiRequest, AgentResponse
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/ai", tags=["MovieOS Role AI Agents"])

def _check_ai_movie_access(movie_id: str, user: Optional[Dict[str, Any]]):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    user_id = user.get("id") if user else None
    if not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only authorized production workspace members can invoke AI agents for this movie project."
        )
    return movie

def _persist_ai_analysis(agent_name: str, movie_id: str, scene_id: str, result: dict, user_id: str = "USR-CURRENT") -> dict:
    analysis_id = str(uuid.uuid4())
    record = {
        "id": analysis_id,
        "agent": agent_name,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "userId": user_id,
        "projectId": movie_id,
        "sceneId": scene_id,
        "status": "COMPLETED" if result.get("analysis") != "AI analysis unavailable. Please try again." else "FAILED",
        "analysis": result.get("analysis", ""),
        "recommendations": result.get("recommendations", []),
        "structuredInsights": result.get("structuredInsights", {}),
        "sources": ["MovieOS Gemini 3.6 Flash Intelligence", "Firestore Context Store"]
    }
    db.set_document("ai_analysis", analysis_id, record)
    return record


@router.post("/director", response_model=ApiResponse[AgentResponse])
def run_director_ai(
    payload: DirectorAiRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_ai_movie_access(payload.movieId, current_user)

    scenes = db.query_collection("scenes", filters=[("movieId", "==", payload.movieId)])
    characters = db.query_collection("characters", filters=[("movieId", "==", payload.movieId)])

    try:
        result = role_agent_orchestrator.run_director_agent(
            movie=movie,
            scenes=scenes,
            characters=characters,
            prompt=payload.prompt,
            context_type=payload.contextType or "SCRIPT_ANALYSIS",
            scene_id=payload.sceneId
        )
    except Exception as e:
        print(f"[Director AI Error]: {e}")
        result = {
            "agentRole": "DIRECTOR",
            "title": "Directorial Vision — Service Notice",
            "analysis": "AI analysis unavailable. Please try again.",
            "structuredInsights": {},
            "recommendations": ["Ensure network connectivity and retry request."],
            "confidenceScore": 0.0,
            "suggestedActions": []
        }

    _persist_ai_analysis("DIRECTOR", payload.movieId, payload.sceneId or "", result, user_id=current_user.get("id", "USR-CURRENT"))
    return ApiResponse(success=True, data=AgentResponse(**result))


@router.post("/producer", response_model=ApiResponse[AgentResponse])
async def run_producer_ai(
    payload: ProducerAiRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_ai_movie_access(payload.movieId, current_user)

    schedules = db.query_collection("schedules", filters=[("movieId", "==", payload.movieId)])
    departments = db.query_collection("departments", filters=[("movieId", "==", payload.movieId)])
    scenes = db.query_collection("scenes", filters=[("movieId", "==", payload.movieId)])
    
    weather_data = None
    if payload.includeWeatherAnalysis and schedules:
        loc = schedules[0].get("location", "Studio Stage 4")
        try:
            weather_data = await weather_service.get_location_weather(loc)
        except Exception:
            weather_data = None

    try:
        result = role_agent_orchestrator.run_producer_agent(
            movie=movie,
            budget_data=None,
            schedules=schedules,
            departments=departments,
            weather_data=weather_data,
            prompt=payload.prompt,
            context_type=payload.contextType or "SCHEDULE_RISK",
            scenes=scenes
        )
    except Exception as e:
        print(f"[Producer AI Error]: {e}")
        result = {
            "agentRole": "PRODUCER",
            "title": "Producer Logistics — Service Notice",
            "analysis": "AI analysis unavailable. Please try again.",
            "structuredInsights": {},
            "recommendations": ["Ensure network connectivity and retry request."],
            "confidenceScore": 0.0,
            "suggestedActions": []
        }

    _persist_ai_analysis("PRODUCER", payload.movieId, "", result, user_id=current_user.get("id", "USR-CURRENT"))
    return ApiResponse(success=True, data=AgentResponse(**result))


@router.post("/actor", response_model=ApiResponse[AgentResponse])
def run_actor_ai(
    payload: ActorAiRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_ai_movie_access(payload.movieId, current_user)

    character = db.get_document("characters", payload.characterId)
    if not character:
        chars = db.query_collection("characters", filters=[("movieId", "==", payload.movieId)])
        character = chars[0] if chars else {"name": "Protagonist", "roleType": "Lead", "description": "Lead role"}

    scene = None
    if payload.sceneId:
        scene = db.get_document("scenes", payload.sceneId)

    try:
        result = role_agent_orchestrator.run_actor_agent(
            character=character,
            scene=scene,
            movie_title=movie.get("title", "Film"),
            prompt=payload.prompt,
            context_type=payload.contextType or "SUBTEXT_ANALYSIS"
        )
    except Exception as e:
        print(f"[Actor AI Error]: {e}")
        result = {
            "agentRole": "ACTOR",
            "title": "Actor Intelligence — Service Notice",
            "analysis": "AI analysis unavailable. Please try again.",
            "structuredInsights": {},
            "recommendations": ["Ensure network connectivity and retry request."],
            "confidenceScore": 0.0,
            "suggestedActions": []
        }

    _persist_ai_analysis("ACTOR", payload.movieId, payload.sceneId or "", result, user_id=current_user.get("id", "USR-CURRENT"))
    return ApiResponse(success=True, data=AgentResponse(**result))


@router.post("/music", response_model=ApiResponse[AgentResponse])
def run_music_ai(
    payload: MusicAiRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_ai_movie_access(payload.movieId, current_user)

    scene = None
    if payload.sceneNumber is not None:
        scenes = db.query_collection("scenes", filters=[("movieId", "==", payload.movieId), ("sceneNumber", "==", payload.sceneNumber)])
        scene = scenes[0] if scenes else None

    character = None
    if payload.characterName:
        chars = db.query_collection("characters", filters=[("movieId", "==", payload.movieId)])
        character = next((c for c in chars if c.get("name", "").lower() == payload.characterName.lower()), None)

    try:
        result = role_agent_orchestrator.run_music_agent(
            movie=movie,
            scene=scene,
            character=character,
            prompt=payload.prompt,
            context_type=payload.contextType or "SCORE_DIRECTION"
        )
    except Exception as e:
        print(f"[Music AI Error]: {e}")
        result = {
            "agentRole": "MUSIC_DIRECTOR",
            "title": "Music Intelligence — Service Notice",
            "analysis": "AI analysis unavailable. Please try again.",
            "structuredInsights": {},
            "recommendations": ["Ensure network connectivity and retry request."],
            "confidenceScore": 0.0,
            "suggestedActions": []
        }

    _persist_ai_analysis("MUSIC_DIRECTOR", payload.movieId, str(payload.sceneNumber) if payload.sceneNumber is not None else "", result, user_id=current_user.get("id", "USR-CURRENT"))
    return ApiResponse(success=True, data=AgentResponse(**result))

