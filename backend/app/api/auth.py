import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header, status
from app.core.config import settings
from app.core.database import db
from app.schemas.auth import UserRegister, UserLogin, UserResponse, UserProfileUpdate
from app.schemas.common import ApiResponse, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])

@router.post("/register", response_model=ApiResponse[UserResponse])
def register_user(payload: UserRegister):
    # Check if user with this email already exists
    existing = db.query_collection("users", filters=[("email", "==", payload.email.lower())])
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email {payload.email} already exists."
        )

    # CRITICAL SECURITY RULE: Newly registered users can NEVER select role = ADMIN from frontend
    requested_role = payload.role
    if requested_role == UserRole.ADMIN or str(requested_role).upper() == "ADMIN":
        requested_role = UserRole.DIRECTOR

    user_id = payload.id if hasattr(payload, 'id') and payload.id else str(uuid.uuid4())
    user_data = payload.model_dump(exclude={"password"})
    user_data["id"] = user_id
    user_data["email"] = payload.email.lower()
    user_data["role"] = requested_role.value if hasattr(requested_role, 'value') else str(requested_role)
    user_data["status"] = "Active"
    user_data["filmography"] = user_data.get("filmography") or []
    user_data["createdAt"] = datetime.now(timezone.utc).isoformat()
    user_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    user_data["lastLogin"] = datetime.now(timezone.utc).isoformat()

    created = db.set_document("users", user_id, user_data)
    return ApiResponse(
        success=True,
        message=f"User {payload.name} registered successfully with role {user_data['role']}.",
        data=UserResponse(**created)
    )

@router.post("/login", response_model=ApiResponse[UserResponse])
def login_user(payload: UserLogin):
    users = db.query_collection("users", filters=[("email", "==", payload.email.lower())])
    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please register or select an active role profile."
        )
    user = users[0]
    
    # Update last login timestamp
    db.update_document("users", user["id"], {"lastLogin": datetime.now(timezone.utc).isoformat()})
    user["lastLogin"] = datetime.now(timezone.utc).isoformat()

    return ApiResponse(
        success=True,
        message=f"Welcome back, {user.get('name')} ({user.get('role')}).",
        data=UserResponse(**user)
    )

@router.get("/me/{user_id}", response_model=ApiResponse[UserResponse])
def get_user_profile(user_id: str):
    user = db.get_document("users", user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")
    return ApiResponse(success=True, data=UserResponse(**user))

@router.put("/profile/{user_id}", response_model=ApiResponse[UserResponse])
def update_user_profile(user_id: str, updates: UserProfileUpdate):
    user = db.get_document("users", user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")
    
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # Protect role escalation from self-update
    if "role" in update_dict:
        del update_dict["role"]

    updated = db.update_document("users", user_id, update_dict)
    return ApiResponse(success=True, message="Profile updated successfully.", data=UserResponse(**updated))
