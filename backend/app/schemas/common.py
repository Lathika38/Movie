from enum import Enum
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class UserRole(str, Enum):
    DIRECTOR = "DIRECTOR"
    PRODUCER = "PRODUCER"
    ACTOR = "ACTOR"
    MUSIC_DIRECTOR = "MUSIC_DIRECTOR"
    ADMIN = "ADMIN"

class MovieStatus(str, Enum):
    DEVELOPMENT = "DEVELOPMENT"
    PRE_PRODUCTION = "PRE_PRODUCTION"
    PRODUCTION = "PRODUCTION"
    POST_PRODUCTION = "POST_PRODUCTION"
    COMPLETED = "COMPLETED"

class CastingStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"

class RoleType(str, Enum):
    LEAD = "Lead"
    SUPPORTING = "Supporting"
    CAMEO = "Cameo"
    SPECIAL_APPEARANCE = "Special Appearance"

class TrackStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REVISION_REQUESTED = "REVISION_REQUESTED"

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[T] = None
    error: Optional[str] = None
