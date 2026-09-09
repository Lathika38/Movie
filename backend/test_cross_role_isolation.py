from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

def test_cross_role_isolation_suite():
    print("\n=======================================================")
    print("MOVIEOS CROSS-ROLE SECURITY & ACCESS ISOLATION SUITE")
    print("=======================================================")

    # Test Users
    dir_id = "test-dir-iso-101"
    prod_id = "test-prod-iso-201"
    act_id = "test-act-iso-301"
    mus_id = "test-mus-iso-401"
    admin_id = "MOVIEOS-ADMIN-001"

    # Test Movies
    dir_movie_id = "test-movie-dir-secrets-001"
    prod_movie_id = "test-movie-prod-financials-002"

    # Clean up prior test artifacts if existing
    for u_id in [dir_id, prod_id, act_id, mus_id, admin_id]:
        db.delete_document("users", u_id)
    for m_id in [dir_movie_id, prod_movie_id]:
        db.delete_document("movies", m_id)

    try:
        # 1. Create User Profiles
        db.set_document("users", dir_id, {
            "id": dir_id,
            "name": "Director Isolation User",
            "email": "dir_iso@movieos.ai",
            "role": "DIRECTOR"
        })
        db.set_document("users", prod_id, {
            "id": prod_id,
            "name": "Producer Isolation User",
            "email": "prod_iso@movieos.ai",
            "role": "PRODUCER"
        })
        db.set_document("users", act_id, {
            "id": act_id,
            "name": "Actor Isolation User",
            "email": "act_iso@movieos.ai",
            "role": "ACTOR"
        })
        db.set_document("users", mus_id, {
            "id": mus_id,
            "name": "Music Isolation User",
            "email": "mus_iso@movieos.ai",
            "role": "MUSIC_DIRECTOR"
        })
        db.set_document("users", admin_id, {
            "id": admin_id,
            "name": "Studio Chief Admin",
            "email": "admin@movieos.ai",
            "role": "ADMIN"
        })

        # 2. Create Project owned strictly by Director Isolation User
        db.set_document("movies", dir_movie_id, {
            "id": dir_movie_id,
            "title": "Director Top Secret Sequence",
            "genre": "Thriller",
            "language": "English",
            "status": "PRE_PRODUCTION",
            "directorId": dir_id,
            "directorName": "Director Isolation User",
            "producerId": "some-other-prod-id",
            "logline": "Confidential Director project.",
            "members": [{"userId": dir_id, "name": "Director Isolation User", "role": "DIRECTOR"}]
        })

        # 3. Create Project owned strictly by Producer Isolation User
        db.set_document("movies", prod_movie_id, {
            "id": prod_movie_id,
            "title": "Producer Financial Vault",
            "genre": "Drama",
            "language": "English",
            "status": "PRE_PRODUCTION",
            "producerId": prod_id,
            "producerName": "Producer Isolation User",
            "directorId": "some-other-dir-id",
            "logline": "Confidential Producer ledger project.",
            "members": [{"userId": prod_id, "name": "Producer Isolation User", "role": "PRODUCER"}]
        })

        # --- FLOW E: UNAUTHENTICATED REQUEST (No Auth Token) ---
        res_unauth = client.get("/api/movies")
        assert res_unauth.status_code == 401, "Unauthenticated requests MUST return 401 Unauthorized!"
        print(" PASS [FLOW E]: Unauthenticated /api/movies query rejected with 401 Unauthorized.")

        # --- FLOW A: DIRECTOR LOGIN & ISOLATION ---
        res_dir = client.get("/api/movies", headers={"Authorization": f"Bearer {dir_id}"})
        assert res_dir.status_code == 200
        dir_movies = res_dir.json().get("data", [])
        dir_movie_ids = [m["id"] for m in dir_movies]
        assert dir_movie_id in dir_movie_ids, "Director should see their own project!"
        assert prod_movie_id not in dir_movie_ids, "Director MUST NOT see Producer's project!"
        print(" PASS [FLOW A]: Director sees ONLY Director project and cannot see Producer project.")

        # --- FLOW B: PRODUCER LOGIN & ISOLATION ---
        res_prod = client.get("/api/movies", headers={"Authorization": f"Bearer {prod_id}"})
        assert res_prod.status_code == 200
        prod_movies = res_prod.json().get("data", [])
        prod_movie_ids = [m["id"] for m in prod_movies]
        assert prod_movie_id in prod_movie_ids, "Producer should see their own project!"
        assert dir_movie_id not in prod_movie_ids, "Producer MUST NOT see Director's project!"
        print(" PASS [FLOW B]: Producer sees ONLY Producer project and cannot see Director project.")

        # --- FLOW C: ACTOR LOGIN & ISOLATION ---
        res_act = client.get("/api/movies", headers={"Authorization": f"Bearer {act_id}"})
        assert res_act.status_code == 200
        act_movies = res_act.json().get("data", [])
        assert len(act_movies) == 0, "Un-offered actor MUST see ZERO movies!"

        # Direct access attempt by Actor to Director's movie
        res_act_direct = client.get(f"/api/movies/{dir_movie_id}", headers={"Authorization": f"Bearer {act_id}"})
        assert res_act_direct.status_code == 403, "Actor direct project URL query must return 403 Forbidden!"
        print(" PASS [FLOW C]: Actor sees ZERO unoffered movies and receives 403 Forbidden on direct project access.")

        # --- FLOW D: SEQUENTIAL ROLE SWITCHING & DIRECT URL PRIVILEGE AUDIT ---
        # 1. Producer tries to update Director's project -> 403 Forbidden
        res_prod_edit = client.put(
            f"/api/movies/{dir_movie_id}",
            json={"title": "Hacked Title"},
            headers={"Authorization": f"Bearer {prod_id}"}
        )
        assert res_prod_edit.status_code == 403, "Producer cannot update Director's project!"
        print(" PASS [FLOW D1]: Producer update to Director project returned 403 Forbidden.")

        # 2. Director tries to update Producer's project -> 403 Forbidden
        res_dir_edit = client.put(
            f"/api/movies/{prod_movie_id}",
            json={"title": "Hacked Title"},
            headers={"Authorization": f"Bearer {dir_id}"}
        )
        assert res_dir_edit.status_code == 403, "Director cannot update Producer's project!"
        print(" PASS [FLOW D2]: Director update to Producer project returned 403 Forbidden.")

        # 3. Studio Chief Admin oversight check -> 200 OK for both
        res_admin_a = client.get(f"/api/movies/{dir_movie_id}", headers={"Authorization": f"Bearer {admin_id}"})
        res_admin_b = client.get(f"/api/movies/{prod_movie_id}", headers={"Authorization": f"Bearer {admin_id}"})
        assert res_admin_a.status_code == 200 and res_admin_b.status_code == 200
        print(" PASS [FLOW D3]: Studio Chief Admin retains executive oversight over all projects.")

        print("=======================================================")
        print(" SUCCESS: ALL CROSS-ROLE ISOLATION TESTS PASSED!")
        print("=======================================================\n")

    finally:
        for u_id in [dir_id, prod_id, act_id, mus_id, admin_id]:
            db.delete_document("users", u_id)
        for m_id in [dir_movie_id, prod_movie_id]:
            db.delete_document("movies", m_id)

if __name__ == "__main__":
    test_cross_role_isolation_suite()

