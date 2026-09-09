import uuid
import io
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status, Depends
from pypdf import PdfReader
from app.core.database import db
from app.core.security import get_current_user
from app.api.movies import is_user_authorized_for_movie
from app.agents.gemini_service import gemini_service
from app.schemas.script import SceneSchema, CharacterSchema, ScriptAnalysisResponse, ScriptUploadRequest
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/scripts", tags=["Screenplay & Script Intelligence"])

def _check_script_movie_access(movie_id: str, user: Optional[Dict[str, Any]]):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    user_id = user.get("id") if user else None
    if not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only authorized production workspace members can access or modify screenplay data."
        )
    return movie

@router.post("/analyze-text", response_model=ApiResponse[ScriptAnalysisResponse])
def analyze_script_text(
    payload: ScriptUploadRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_script_movie_access(payload.movieId, current_user)

    analysis = gemini_service.analyze_screenplay(
        movie_id=payload.movieId,
        script_text=payload.scriptContent,
        title=movie.get("title", "Untitled Project"),
        genre=movie.get("genre", "Cinema")
    )

    # Save Script Record in Firestore
    script_id = str(uuid.uuid4())
    script_doc = {
        "id": script_id,
        "movieId": payload.movieId,
        "version": payload.version,
        "content": payload.scriptContent,
        "summary": analysis.get("summary"),
        "themes": analysis.get("themes", []),
        "estimatedShootingDays": analysis.get("estimatedShootingDays", 30),
        "productionComplexity": analysis.get("productionComplexity", "Medium"),
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    db.set_document("scripts", script_id, script_doc)

    # Wipe and replace previous generated scenes/characters for this movie version
    existing_scenes = db.query_collection("scenes", filters=[("movieId", "==", payload.movieId)])
    for s in existing_scenes:
        db.delete_document("scenes", s["id"])
    
    existing_chars = db.query_collection("characters", filters=[("movieId", "==", payload.movieId)])
    for c in existing_chars:
        db.delete_document("characters", c["id"])

    # Persist extracted scenes
    saved_scenes = []
    for sc in analysis.get("scenes", []):
        sc_id = str(uuid.uuid4())
        sc["id"] = sc_id
        sc["movieId"] = payload.movieId
        db.set_document("scenes", sc_id, sc)
        saved_scenes.append(SceneSchema(**sc))

    # Persist extracted characters
    saved_characters = []
    for ch in analysis.get("characters", []):
        ch_id = str(uuid.uuid4())
        ch["id"] = ch_id
        ch["movieId"] = payload.movieId
        db.set_document("characters", ch_id, ch)
        saved_characters.append(CharacterSchema(**ch))

    # Wipe and auto-generate shooting schedules / call sheets for Producer
    existing_schedules = db.query_collection("schedules", filters=[("movieId", "==", payload.movieId)])
    for sch in existing_schedules:
        db.delete_document("schedules", sch["id"])

    base_date = datetime.now(timezone.utc)
    for idx, sc in enumerate(saved_scenes):
        sc_dict = sc.model_dump() if hasattr(sc, "model_dump") else sc
        sc_date = (base_date + timedelta(days=idx * 2 + 1)).strftime("%Y-%m-%d")
        sc_num = sc_dict.get("sceneNumber", idx + 1)
        heading = sc_dict.get("heading") or f"Scene {sc_num}"
        loc = sc_dict.get("location") or "Studio Soundstage"
        setting = sc_dict.get("setting", "EXT")
        sched_item = {
            "id": str(uuid.uuid4()),
            "movieId": payload.movieId,
            "sceneId": sc_dict.get("id"),
            "sceneNumber": sc_num,
            "title": f"Scene {sc_num}: {heading}",
            "sceneHeading": heading,
            "location": loc,
            "setting": setting,
            "shootingDate": sc_date,
            "startTime": "06:30 AM",
            "endTime": "06:30 PM",
            "callTime": "06:30 AM",
            "wrapTime": "06:30 PM",
            "charactersNeeded": sc_dict.get("characters", []),
            "equipmentNeeded": ["Main Cinema Camera Package", "Sound Boom Kit", "Lighting Rigs"],
            "propsNeeded": [],
            "assignedCrew": ["Director", "DOP / Cinematographer", "Sound Recordist", "Gaffer", "Line Producer"],
            "status": "SCHEDULED",
            "weatherRiskLevel": "LOW" if setting == "INT" else "MEDIUM",
            "weatherNotes": "Indoor soundstage - weather shielded" if setting == "INT" else "Live meteorological monitoring active.",
            "notes": sc_dict.get("description", "Filming planned according to director breakdown"),
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
        db.set_document("schedules", sched_item["id"], sched_item)

    # Update movie with logline, totalScenes, shooting days
    db.update_document("movies", payload.movieId, {
        "logline": analysis.get("summary") or movie.get("logline", ""),
        "totalScenes": len(saved_scenes),
        "estimatedShootingDays": analysis.get("estimatedShootingDays", 30),
        "productionComplexity": analysis.get("productionComplexity", "Medium")
    })

    res = ScriptAnalysisResponse(
        movieId=payload.movieId,
        title=movie.get("title"),
        summary=analysis.get("summary", ""),
        genre=movie.get("genre", ""),
        scenes=saved_scenes,
        characters=saved_characters,
        themes=analysis.get("themes", []),
        productionComplexity=analysis.get("productionComplexity", "Medium"),
        estimatedShootingDays=analysis.get("estimatedShootingDays", 30),
        recommendedLocations=analysis.get("recommendedLocations", [])
    )
    return ApiResponse(success=True, message="Screenplay analyzed and scene breakdown created successfully.", data=res)

@router.post("/upload-file", response_model=ApiResponse[ScriptAnalysisResponse])
async def upload_script_file(
    movieId: str = Form(...),
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_script_movie_access(movieId, current_user)

    contents = await file.read()
    script_text = ""

    if file.filename.lower().endswith(".pdf"):
        try:
            pdf_file = io.BytesIO(contents)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    script_text += text + "\n"
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to parse PDF: {str(e)}")
    else:
        try:
            script_text = contents.decode("utf-8")
        except UnicodeDecodeError:
            script_text = contents.decode("latin-1")

    if not script_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty or text could not be extracted.")

    return analyze_script_text(ScriptUploadRequest(movieId=movieId, scriptContent=script_text, version=file.filename), current_user=current_user)

@router.get("/scenes/{movie_id}", response_model=ApiResponse[List[SceneSchema]])
def get_movie_scenes(
    movie_id: str,
    user_id: Optional[str] = None,
    character_name: Optional[str] = None,
    setting: Optional[str] = None,
    time_of_day: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    eff_user_id = user_id
    if current_user and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")):
        eff_user_id = current_user.get("id")
    elif not eff_user_id and current_user:
        eff_user_id = current_user.get("id")

    if not eff_user_id or not is_user_authorized_for_movie(movie, eff_user_id):
        return ApiResponse(success=True, message="Access Restricted: You must be an authorized member of this movie project.", data=[])

    scenes = db.query_collection("scenes", filters=[("movieId", "==", movie_id)], order_by="sceneNumber")
    if character_name:
        scenes = [s for s in scenes if character_name.lower() in [c.lower() for c in s.get("characters", [])]]
    if setting:
        scenes = [s for s in scenes if s.get("setting") == setting.upper()]
    if time_of_day:
        scenes = [s for s in scenes if s.get("timeOfDay") == time_of_day.upper()]

    return ApiResponse(success=True, data=[SceneSchema(**s) for s in scenes])

@router.get("/characters/{movie_id}", response_model=ApiResponse[List[CharacterSchema]])
def get_movie_characters(
    movie_id: str,
    user_id: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    eff_user_id = user_id
    if current_user and not (current_user.get("role") == "ADMIN" or current_user.get("is_admin_claim")):
        eff_user_id = current_user.get("id")
    elif not eff_user_id and current_user:
        eff_user_id = current_user.get("id")

    if not eff_user_id or not is_user_authorized_for_movie(movie, eff_user_id):
        return ApiResponse(success=True, message="Access Restricted: You must be an authorized member of this movie project.", data=[])

    characters = db.query_collection("characters", filters=[("movieId", "==", movie_id)])
    return ApiResponse(success=True, data=[CharacterSchema(**c) for c in characters])

@router.put("/scenes/{scene_id}", response_model=ApiResponse[SceneSchema])
def update_scene(
    scene_id: str,
    updates: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    scene = db.get_document("scenes", scene_id)
    if not scene:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scene not found.")
    _check_script_movie_access(scene.get("movieId"), current_user)

    updated = db.update_document("scenes", scene_id, updates)
    return ApiResponse(success=True, message="Scene updated.", data=SceneSchema(**updated))

