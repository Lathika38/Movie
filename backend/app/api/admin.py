from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status, Body
from app.core.config import settings
from app.core.database import db
from app.core.security import require_admin
from app.schemas.auth import UserResponse, UserProfileUpdate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/admin", tags=["Single Admin User Management"])

@router.get("/users", response_model=ApiResponse[List[UserResponse]])
def get_all_users_for_admin(admin_user: Dict[str, Any] = Depends(require_admin)):
    """Retrieve full studio user telemetry for single admin dashboard."""
    users = db.query_collection("users")
    # Clean sensitive internal flags if any, ensure non-exposure of secrets
    cleaned = [UserResponse(**u) for u in users]
    return ApiResponse(
        success=True,
        message=f"Retrieved {len(cleaned)} studio profiles for Admin.",
        data=cleaned
    )

@router.get("/users/{uid}", response_model=ApiResponse[UserResponse])
def get_user_detail_for_admin(uid: str, admin_user: Dict[str, Any] = Depends(require_admin)):
    """Retrieve specific user profile for inspection."""
    user = db.get_document("users", uid)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return ApiResponse(success=True, data=UserResponse(**user))

@router.patch("/users/{uid}", response_model=ApiResponse[UserResponse])
def update_user_profile_by_admin(
    uid: str,
    updates: UserProfileUpdate,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """Admin update of permitted non-sensitive profile information."""
    existing = db.get_document("users", uid)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")

    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # Prevent modifying role to preserve single admin integrity
    if "role" in update_dict:
        del update_dict["role"]

    updated = db.update_document("users", uid, update_dict)
    return ApiResponse(
        success=True,
        message=f"User profile for '{existing.get('name')}' updated successfully.",
        data=UserResponse(**updated)
    )

@router.post("/users/{uid}/disable", response_model=ApiResponse[bool])
def disable_user_by_admin(uid: str, admin_user: Dict[str, Any] = Depends(require_admin)):
    """Disable user account in Firebase Authentication & Firestore."""
    if uid == settings.MOVIEOS_ADMIN_UID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Forbidden: The Single Admin account cannot be disabled."
        )

    success = db.disable_user_account(uid)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to disable user account.")

    return ApiResponse(
        success=True,
        message=f"User account {uid} has been disabled.",
        data=True
    )

@router.post("/users/{uid}/enable", response_model=ApiResponse[bool])
def enable_user_by_admin(uid: str, admin_user: Dict[str, Any] = Depends(require_admin)):
    """Re-enable user account in Firebase Authentication & Firestore."""
    success = db.enable_user_account(uid)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to enable user account.")

    return ApiResponse(
        success=True,
        message=f"User account {uid} has been re-enabled.",
        data=True
    )

@router.post("/users/{uid}/reset-password", response_model=ApiResponse[str])
def reset_user_password_by_admin(uid: str, admin_user: Dict[str, Any] = Depends(require_admin)):
    """Trigger password reset flow via Firebase Auth. Raw passwords are NEVER exposed."""
    user = db.get_document("users", uid)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    email = user.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User does not have a valid email.")

    result_msg = db.generate_password_reset(email)
    return ApiResponse(
        success=True,
        message=f"Password reset initiated for {email}.",
        data=result_msg or f"Reset instructions sent to {email}."
    )

@router.delete("/users/{uid}", response_model=ApiResponse[bool])
def delete_user_by_admin(uid: str, admin_user: Dict[str, Any] = Depends(require_admin)):
    """Delete user from Firebase Auth & Firestore. Protects single admin account."""
    if uid == settings.MOVIEOS_ADMIN_UID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Violation: The Single Admin account cannot be deleted."
        )

    user = db.get_document("users", uid)
    if user and (user.get("role") == "ADMIN" or user.get("id") == settings.MOVIEOS_ADMIN_UID):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Violation: Admin account is protected against deletion."
        )

    deleted = db.delete_user_account(uid)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User deletion failed.")

    return ApiResponse(
        success=True,
        message=f"User account {uid} safely deleted from Firebase Auth and Firestore.",
        data=True
    )
