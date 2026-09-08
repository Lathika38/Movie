from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.schemas.common import UserRole

class UserRegister(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password: str
    name: str
    role: UserRole
    bio: Optional[str] = ""
    phone: Optional[str] = ""
    avatarUrl: Optional[str] = ""
    skills: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    genres: Optional[List[str]] = []
    showreelUrl: Optional[str] = ""
    achievements: Optional[List[str]] = []
    availability: Optional[str] = "Available"
    productionCompany: Optional[str] = ""
    actorType: Optional[str] = ""
    guildStatus: Optional[str] = ""
    cameraPackage: Optional[str] = ""
    dawSetup: Optional[str] = ""
    instrumentPalette: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    genres: Optional[List[str]] = None
    showreelUrl: Optional[str] = None
    achievements: Optional[List[str]] = None
    availability: Optional[str] = None
    productionCompany: Optional[str] = None
    actorType: Optional[str] = None
    guildStatus: Optional[str] = None
    cameraPackage: Optional[str] = None
    dawSetup: Optional[str] = None
    instrumentPalette: Optional[str] = None

class FilmographyItem(BaseModel):
    movieId: str
    movieTitle: str
    releaseYear: int
    characterName: str
    roleType: str
    genre: str
    directorName: Optional[str] = None
    status: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    bio: Optional[str] = ""
    phone: Optional[str] = ""
    avatarUrl: Optional[str] = ""
    skills: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    genres: Optional[List[str]] = []
    showreelUrl: Optional[str] = ""
    achievements: Optional[List[str]] = []
    availability: Optional[str] = "Available"
    productionCompany: Optional[str] = ""
    actorType: Optional[str] = ""
    guildStatus: Optional[str] = ""
    cameraPackage: Optional[str] = ""
    dawSetup: Optional[str] = ""
    instrumentPalette: Optional[str] = ""
    filmography: Optional[List[FilmographyItem]] = []
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
