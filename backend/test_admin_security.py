import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import db

client = TestClient(app)

def test_signup_role_escalation_prevented():
    """Verify that registering with role = ADMIN is rejected at schema level (422) or overridden."""
    payload = {
        "email": "hacker@cinema.test",
        "password": "SecretPassword123!",
        "name": "Hacker User",
        "role": "ADMIN"
    }
    response = client.post("/api/auth/register", json=payload)
    # Schema validation rejects ADMIN role enum with 422
    assert response.status_code in (422, 400, 200)
    if response.status_code == 200:
        data = response.json()
        assert data["data"]["role"] != "ADMIN"


def test_admin_route_unauthorized_access_rejected():
    """Verify that calling /api/admin/users without token returns 401 Unauthorized."""
    response = client.get("/api/admin/users")
    assert response.status_code == 401


def test_admin_route_normal_user_forbidden():
    """Verify that a normal user calling /api/admin/users receives 403 Forbidden."""
    user_id = "test-user-normal-001"
    db.set_document("users", user_id, {
        "id": user_id,
        "email": "normal@cinema.test",
        "name": "Normal Filmmaker",
        "role": "DIRECTOR"
    })

    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {user_id}"}
    )
    assert response.status_code == 403
    assert "Administrative Privileges Required" in response.json()["detail"]

    db.delete_document("users", user_id)


def test_admin_route_single_admin_success():
    """Verify that the Single Admin (MOVIEOS-ADMIN-001) can access /api/admin/users."""
    admin_id = settings.MOVIEOS_ADMIN_UID
    db.set_document("users", admin_id, {
        "id": admin_id,
        "email": settings.MOVIEOS_ADMIN_EMAIL,
        "name": "DEVIL (Studio Chief)",
        "role": "ADMIN"
    })

    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer mock-id-token-{admin_id}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_admin_disable_and_enable_user():
    """Verify admin can disable and enable normal user accounts."""
    admin_id = settings.MOVIEOS_ADMIN_UID
    target_id = "test-user-target-002"
    db.set_document("users", target_id, {
        "id": target_id,
        "email": "target@cinema.test",
        "name": "Target User",
        "role": "ACTOR",
        "status": "Active"
    })

    # Disable
    dis_res = client.post(
        f"/api/admin/users/{target_id}/disable",
        headers={"Authorization": f"Bearer mock-id-token-{admin_id}"}
    )
    assert dis_res.status_code == 200
    assert dis_res.json()["data"] is True
    
    updated = db.get_document("users", target_id)
    assert updated["status"] == "Disabled"

    # Enable
    en_res = client.post(
        f"/api/admin/users/{target_id}/enable",
        headers={"Authorization": f"Bearer mock-id-token-{admin_id}"}
    )
    assert en_res.status_code == 200
    assert en_res.json()["data"] is True

    updated_again = db.get_document("users", target_id)
    assert updated_again["status"] == "Active"

    db.delete_document("users", target_id)


def test_admin_delete_user_and_admin_protection():
    """Verify admin can delete normal users, but cannot delete the Single Admin account."""
    admin_id = settings.MOVIEOS_ADMIN_UID

    # 1. Attempt to delete admin -> REJECTED
    del_admin_res = client.delete(
        f"/api/admin/users/{admin_id}",
        headers={"Authorization": f"Bearer mock-id-token-{admin_id}"}
    )
    assert del_admin_res.status_code == 400
    assert "Single Admin account cannot be deleted" in del_admin_res.json()["detail"]

    # 2. Delete normal user -> SUCCESS
    target_id = "test-user-to-delete-003"
    db.set_document("users", target_id, {
        "id": target_id,
        "email": "todelete@cinema.test",
        "name": "To Delete",
        "role": "PRODUCER"
    })

    del_res = client.delete(
        f"/api/admin/users/{target_id}",
        headers={"Authorization": f"Bearer mock-id-token-{admin_id}"}
    )
    assert del_res.status_code == 200
    assert del_res.json()["data"] is True
    assert db.get_document("users", target_id) is None


def test_admin_reset_password_no_secrets():
    """Verify reset password endpoint does not return or store passwords."""
    admin_id = settings.MOVIEOS_ADMIN_UID
    target_id = "test-user-pwd-004"
    db.set_document("users", target_id, {
        "id": target_id,
        "email": "pwdreset@cinema.test",
        "name": "Password Reset User",
        "role": "ACTOR"
    })

    res = client.post(
        f"/api/admin/users/{target_id}/reset-password",
        headers={"Authorization": f"Bearer mock-id-token-{admin_id}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "pwdreset@cinema.test" in str(data["data"]) or "reset" in data["message"].lower()
    assert "SecretPassword" not in str(data)
    assert "hash" not in str(data)

    db.delete_document("users", target_id)
