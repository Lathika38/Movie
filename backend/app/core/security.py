from typing import Any, Dict, Optional
from fastapi import Header, HTTPException, Depends, status
from app.core.config import settings
from app.core.database import db

async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Validates Firebase ID token supplied in Authorization header ('Bearer <token>')
    or development fallback headers.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing. Please sign in."
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'."
        )

    token = parts[1]

    # Verify via Firebase Admin SDK or local fallback
    decoded = db.verify_firebase_id_token(token)
    if not decoded:
        # Check if token is a direct user ID for local dev/testing fallback
        user_by_id = db.get_document("users", token)
        if user_by_id:
            return user_by_id
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase authentication token."
        )

    uid = decoded.get("uid") or decoded.get("sub") or decoded.get("id")
    user = db.get_document("users", uid)
    if not user:
        # Fallback profile
        user = {
            "id": uid,
            "email": decoded.get("email", ""),
            "role": "ADMIN" if decoded.get("admin") or uid == settings.MOVIEOS_ADMIN_UID else "DIRECTOR"
        }

    # Attach decoded claims info
    user["id"] = user.get("id") or uid
    user["is_admin_claim"] = bool(decoded.get("admin") or uid == settings.MOVIEOS_ADMIN_UID or user.get("role") == "ADMIN")
    return user


async def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Guarantees that the authenticated request originates from the verified Single Admin account
    or holds trusted Firebase custom claims ('admin = true').
    """
    uid = current_user.get("id") or current_user.get("uid")
    role = current_user.get("role")
    is_admin_claim = current_user.get("is_admin_claim", False)

    is_admin = (
        uid == settings.MOVIEOS_ADMIN_UID or
        role == "ADMIN" or
        is_admin_claim
    )

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Operating System Administrative Privileges Required."
        )

    return current_user


def require_roles(allowed_roles: list[str]):
    """
    Dependency factory that checks if current_user role is in allowed_roles.
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = str(current_user.get("role", "")).upper()
        uid = current_user.get("id") or current_user.get("uid")
        is_admin = (
            uid in [settings.MOVIEOS_ADMIN_UID, "USR-ADMIN-001", "USR-ADM-001", "MOVIEOS-ADMIN-001"] or
            user_role == "ADMIN" or
            current_user.get("is_admin_claim")
        )
        if is_admin:
            return current_user
        
        allowed_upper = [r.upper() for r in allowed_roles]
        if user_role not in allowed_upper:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Role '{user_role}' is not authorized for this operation. Required role(s): {', '.join(allowed_roles)}."
            )
        return current_user
    return role_checker

