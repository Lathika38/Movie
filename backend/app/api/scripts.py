import uuid
import io
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pypdf import PdfReader
from app.core.database import db
from app.agents.gemini_service import gemini_service
from app.schemas.script import SceneSchema, CharacterSchema, ScriptAnalysisResponse, ScriptUploadRequest
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/scripts", tags=["Screenplay & Script Intelligence"])

@router.post("/analyze-text", response_model=ApiResponse[ScriptAnalysisResponse])
def analyze_script_text(payload: ScriptUploadRequest):
    movie = db.get_document("movies", payload.movieId)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

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

    # Update movie with logline and total scenes if missing
    if not movie.get("logline") and analysis.get("summary"):
        db.update_document("movies", payload.movieId, {"logline": analysis.get("summary")})

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
    file: UploadFile = File(...)
):
    movie = db.get_document("movies", movieId)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

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

    return analyze_script_text(ScriptUploadRequest(movieId=movieId, scriptContent=script_text, version=file.filename))

@router.get("/scenes/{movie_id}", response_model=ApiResponse[List[SceneSchema]])
def get_movie_scenes(
    movie_id: str,
    user_id: Optional[str] = None,
    character_name: Optional[str] = None,
    setting: Optional[str] = None,
    time_of_day: Optional[str] = None
):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    if user_id:
        user_doc = db.get_document("users", user_id)
        user_role = user_doc.get("role") if user_doc else None
        user_email = user_doc.get("email") if user_doc else None
        
        # ACTOR role restriction: Actors can only view screenplay scenes if signed or have a pending casting offer
        if user_role == "ACTOR":
            is_creator_or_member = (
                movie.get("producerId") == user_id or
                movie.get("directorId") == user_id or
                movie.get("musicDirectorId") == user_id or
                any(mem.get("userId") == user_id for mem in movie.get("members", []))
            )
            movie_offers = db.query_collection("castingRequests", filters=[("movieId", "==", movie_id)])
            has_offer_or_signed = any(
                (req.get("actorId") == user_id or (user_email and req.get("actorEmail") == user_email)) and
                req.get("status") in ["PENDING", "ACCEPTED"]
                for req in movie_offers
            )
            if not (is_creator_or_member or has_offer_or_signed):
                return ApiResponse(success=True, message="Access Restricted: You must be signed to this project or have an active casting offer to view screenplay scenes.", data=[])

    scenes = db.query_collection("scenes", filters=[("movieId", "==", movie_id)], order_by="sceneNumber")
    if character_name:
        scenes = [s for s in scenes if character_name.lower() in [c.lower() for c in s.get("characters", [])]]
    if setting:
        scenes = [s for s in scenes if s.get("setting") == setting.upper()]
    if time_of_day:
        scenes = [s for s in scenes if s.get("timeOfDay") == time_of_day.upper()]

    return ApiResponse(success=True, data=[SceneSchema(**s) for s in scenes])

@router.get("/characters/{movie_id}", response_model=ApiResponse[List[CharacterSchema]])
def get_movie_characters(movie_id: str, user_id: Optional[str] = None):
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    if user_id:
        user_doc = db.get_document("users", user_id)
        user_role = user_doc.get("role") if user_doc else None
        user_email = user_doc.get("email") if user_doc else None
        
        # ACTOR role restriction: Actors can only view character breakdowns if signed or have a pending casting offer
        if user_role == "ACTOR":
            is_creator_or_member = (
                movie.get("producerId") == user_id or
                movie.get("directorId") == user_id or
                movie.get("musicDirectorId") == user_id or
                any(mem.get("userId") == user_id for mem in movie.get("members", []))
            )
            movie_offers = db.query_collection("castingRequests", filters=[("movieId", "==", movie_id)])
            has_offer_or_signed = any(
                (req.get("actorId") == user_id or (user_email and req.get("actorEmail") == user_email)) and
                req.get("status") in ["PENDING", "ACCEPTED"]
                for req in movie_offers
            )
            if not (is_creator_or_member or has_offer_or_signed):
                return ApiResponse(success=True, message="Access Restricted: You must be signed to this project or have an active casting offer.", data=[])

    characters = db.query_collection("characters", filters=[("movieId", "==", movie_id)])
    return ApiResponse(success=True, data=[CharacterSchema(**c) for c in characters])

@router.put("/scenes/{scene_id}", response_model=ApiResponse[SceneSchema])
def update_scene(scene_id: str, updates: dict):
    updated = db.update_document("scenes", scene_id, updates)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scene not found.")
    return ApiResponse(success=True, message="Scene updated.", data=SceneSchema(**updated))
