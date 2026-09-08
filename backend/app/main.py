import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import db
from seed_data import seed_database

# Routers
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.users import router as users_router
from app.api.movies import router as movies_router
from app.api.scripts import router as scripts_router
from app.api.casting import router as casting_router
from app.api.producer import router as producer_router
from app.api.music import router as music_router
from app.api.notifications import router as notifications_router
from app.api.ai import router as ai_router
from app.api.weather import router as weather_router
from app.api.research import router as research_router
from app.api.seed import router as seed_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[MovieOS] Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    # Seed sample database if empty
    existing_movies = db.query_collection("movies")
    if not existing_movies:
        print("[MovieOS] Initializing default cinema production data...")
        try:
            seed_database()
        except Exception as e:
            print(f"[MovieOS] Seed warning: {e}")
    yield
    print("[MovieOS] Shutting down Cinema Operating System...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified AI-Powered Cinema Operating System connecting Directors, Producers, Actors, Music Directors, and Admins.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[MovieOS API Error] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal cinema system error occurred. Please retry.",
            "error": str(exc)
        }
    )

# Include Domain Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)
app.include_router(users_router, prefix=settings.API_PREFIX)
app.include_router(movies_router, prefix=settings.API_PREFIX)
app.include_router(scripts_router, prefix=settings.API_PREFIX)
app.include_router(casting_router, prefix=settings.API_PREFIX)
app.include_router(producer_router, prefix=settings.API_PREFIX)
app.include_router(music_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(weather_router, prefix=settings.API_PREFIX)
app.include_router(research_router, prefix=settings.API_PREFIX)
app.include_router(seed_router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "system": "MovieOS - Cinema Operating System",
        "version": settings.VERSION,
        "docsUrl": "/docs"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": "2026-08-31T12:00:00Z",
        "moviesCount": len(db.query_collection("movies")),
        "usersCount": len(db.query_collection("users"))
    }
