from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

def test_profile_and_producer_realtime_sync():
    print("--- Testing Real-Time User Profile & Producer Dashboard Database Sync ---")

    # 1. Fetch users from API
    res_users = client.get("/api/users")
    assert res_users.status_code == 200
    users = res_users.json()["data"]
    assert len(users) > 0, "Expected at least one user in database."
    test_user = users[0]
    user_id = test_user["id"]

    # 2. Update user profile via API PUT /api/auth/profile/{user_id}
    updated_bio = "Executive Producer with 15+ years experience in IMAX productions."
    updated_skills = ["Executive Line Producing", "International Financing", "IMAX Distribution"]
    profile_payload = {
        "bio": updated_bio,
        "skills": updated_skills,
        "availability": "On Location"
    }

    res_put = client.put(f"/api/auth/profile/{user_id}", json=profile_payload)
    assert res_put.status_code == 200
    updated_user_data = res_put.json()["data"]
    assert updated_user_data["bio"] == updated_bio
    assert updated_user_data["availability"] == "On Location"
    print(" PASS: Profile update via PUT /api/auth/profile succeeded.")

    # 3. Direct database read verification (get_document 'users')
    doc = db.get_document("users", user_id)
    assert doc is not None
    assert doc["bio"] == updated_bio
    assert doc["availability"] == "On Location"
    print(" PASS: Profile data is immediately stored in database in real-time!")

    # 4. Fetch profile via GET /api/auth/me/{user_id} and confirm real-time synchronization
    res_get = client.get(f"/api/auth/me/{user_id}")
    assert res_get.status_code == 200
    fetched = res_get.json()["data"]
    assert fetched["bio"] == updated_bio
    print(" PASS: Profile read via GET /api/auth/me reflects real-time database state.")

    # 5. Producer Dashboard Department Real-Time Sync Test
    movies = db.query_collection("movies")
    assert len(movies) > 0
    movie_id = movies[0]["id"]

    dep_payload = {
        "movieId": movie_id,
        "name": "Aerial Stunts & Drone Cinematography",
        "headOfDepartment": "Captain Alex Rivera",
        "budgetAllocated": 1500000.0,
        "taskSummary": "High-altitude IMAX drone camera maneuvers.",
        "teamCount": 8,
        "status": "ACTIVE"
    }
    res_dep = client.post("/api/producer/departments", json=dep_payload)
    assert res_dep.status_code == 200
    created_dep = res_dep.json()["data"]
    dep_id = created_dep["id"]
    print(" PASS: Registered department via API. ID:", dep_id)

    # 6. Verify department in GET /api/producer/departments/{movie_id}
    res_deps_get = client.get(f"/api/producer/departments/{movie_id}")
    assert res_deps_get.status_code == 200
    dep_list = res_deps_get.json()["data"]
    assert any(d["id"] == dep_id for d in dep_list), "New department MUST be readable in real time!"
    print(" PASS: Department immediately queryable in real-time producer endpoint.")

    # Clean up test department
    db.delete_document("departments", dep_id)
    print(" PASS: Test department cleaned up.")

    print("\n REAL-TIME PROFILE & PRODUCER DATABASE SYNC VERIFIED PERFECTLY!")

if __name__ == "__main__":
    test_profile_and_producer_realtime_sync()
