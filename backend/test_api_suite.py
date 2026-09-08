from fastapi.testclient import TestClient
from app.main import app
import sys

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Root & Health Check ---")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print(" Root OK:", res.json())

    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print(" Health OK:", res.json())

    print("\n--- 2. Testing Movies Endpoints ---")
    res = client.get("/api/movies")
    assert res.status_code == 200, f"Get movies failed: {res.text}"
    movies = res.json().get("data", [])
    print(f" Movies count: {len(movies)}")
    assert len(movies) > 0, "Expected at least 1 seeded movie"
    movie_id = movies[0]["id"]

    res = client.get(f"/api/movies/{movie_id}")
    assert res.status_code == 200, f"Get movie details failed: {res.text}"
    print(f" Active movie: {res.json()['data']['title']}")

    print("\n--- 3. Testing Users & Casting ---")
    res = client.get("/api/users")
    assert res.status_code == 200, f"Get users failed: {res.text}"
    users = res.json().get("data", [])
    print(f" Users count: {len(users)}")

    res = client.get(f"/api/casting/movie/{movie_id}")
    assert res.status_code == 200, f"Get movie casting failed: {res.text}"
    print(f" Movie casting requests count: {len(res.json().get('data', []))}")

    print("\n--- 4. Testing Scripts & Scenes ---")
    res = client.get(f"/api/scripts/scenes/{movie_id}")
    assert res.status_code == 200, f"Get scenes failed: {res.text}"
    scenes = res.json().get("data", [])
    print(f" Scenes count: {len(scenes)}")

    res = client.get(f"/api/scripts/characters/{movie_id}")
    assert res.status_code == 200, f"Get characters failed: {res.text}"
    characters = res.json().get("data", [])
    print(f" Characters count: {len(characters)}")

    print("\n--- 5. Testing Producer Schedules & Expenses ---")
    res = client.get(f"/api/producer/schedules/{movie_id}")
    assert res.status_code == 200, f"Get schedules failed: {res.text}"
    print(f" Schedules count: {len(res.json().get('data', []))}")

    res = client.get(f"/api/producer/expenses/{movie_id}")
    assert res.status_code == 200, f"Get expenses failed: {res.text}"
    print(f" Expenses count: {len(res.json().get('data', []))}")

    res = client.get(f"/api/producer/budget-breakdown/{movie_id}")
    assert res.status_code == 200, f"Get budget breakdown failed: {res.text}"
    print(f" Budget breakdown OK: totalBudget = ${res.json()['data']['totalBudget']:,.2f}")

    print("\n--- 6. Testing Music Tracks ---")
    res = client.get(f"/api/music/tracks/{movie_id}")
    assert res.status_code == 200, f"Get music tracks failed: {res.text}"
    print(f" Music tracks count: {len(res.json().get('data', []))}")

    print("\n--- 7. Testing Weather Endpoint ---")
    res = client.get("/api/weather?location=Tokyo")
    assert res.status_code == 200, f"Weather endpoint failed: {res.text}"
    wth = res.json().get("data", {})
    print(f" Weather response: location={wth.get('location')}, temp={wth.get('temperatureC')}, available={wth.get('available', True)}")

    print("\n--- 8. Testing AI Agent Endpoints ---")
    res = client.post("/api/ai/director", json={
        "movieId": movie_id,
        "prompt": "Suggest camera lenses for the climax scene",
        "contextType": "SHOT_SUGGESTION"
    })
    assert res.status_code == 200, f"Director AI failed: {res.text}"
    print(f" Director AI OK: {res.json()['data']['title']}")

    res = client.post("/api/ai/producer", json={
        "movieId": movie_id,
        "prompt": "Evaluate weather and schedule risks",
        "contextType": "SCHEDULE_RISK"
    })
    assert res.status_code == 200, f"Producer AI failed: {res.text}"
    print(f" Producer AI OK: {res.json()['data']['title']}")

    res = client.post("/api/ai/music", json={
        "movieId": movie_id,
        "prompt": "Suggest key and tempo for suspense scene",
        "contextType": "SCORE_DIRECTION"
    })
    assert res.status_code == 200, f"Music AI failed: {res.text}"
    print(f" Music AI OK: {res.json()['data']['title']}")

    print("\n ALL BACKEND API TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
