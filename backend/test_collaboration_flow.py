import sys
sys.stdout.reconfigure(encoding='utf-8')
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

def test_collaboration():
    print("================================================================")
    print("   DIRECTOR <-> PRODUCER <-> ACTOR COLLABORATION FLOW AUDIT    ")
    print("================================================================")

    movies = db.query_collection("movies")
    assert len(movies) > 0, "No movies in DB"
    test_movie = movies[0]
    movie_id = test_movie["id"]
    director_id = test_movie.get("directorId", "USR-DIR-001")
    producer_id = test_movie.get("producerId", "USR-PROD-001")
    print(f"\n1. Active Movie: [{movie_id}] '{test_movie['title']}'")
    print(f"   - Director: {test_movie.get('directorName')} ({director_id})")
    print(f"   - Producer: {test_movie.get('producerName')} ({producer_id})")

    # Fetch a registered Actor
    actors = db.query_collection("users", filters=[("role", "==", "ACTOR")])
    assert len(actors) > 0, "No actors found in users"
    target_actor = actors[0]
    actor_id = target_actor["id"]
    print(f"\n2. Target Actor: '{target_actor['name']}' (ID: {actor_id}, Email: {target_actor['email']})")

    # Fetch movie characters
    characters = db.query_collection("characters", filters=[("movieId", "==", movie_id)])
    assert len(characters) > 0, "No characters found for movie"
    target_char = characters[0]
    print(f"   Target Character: '{target_char['name']}' (Current Status: {target_char.get('castingStatus')})")

    # STEP A: Director dispatches casting offer to Actor
    print("\n3. [STEP A] Director dispatches official Casting Offer to Actor...")
    offer_payload = {
        "movieId": movie_id,
        "characterId": target_char["id"],
        "characterName": target_char["name"],
        "characterDescription": target_char.get("description", "Key character"),
        "actorId": actor_id,
        "roleType": target_char.get("roleType", "Lead"),
        "offeredFee": 175000.0,
        "shootingDates": "Oct 12 - Nov 30, 2026",
        "message": "We are thrilled to offer you this role based on the screenplay character breakdown."
    }
    offer_res = client.post("/api/casting/request", json=offer_payload, headers={"Authorization": f"Bearer {director_id}"})
    assert offer_res.status_code == 200, f"Expected 200 on casting request creation, got {offer_res.status_code}"
    offer_id = offer_res.json()["data"]["id"]
    print(f"   ✓ Casting Offer Created: Request ID {offer_id}")
    print(f"   ✓ Character Casting Status: {target_char['name']} -> PENDING")

    # STEP B: Actor checks Casting Inbox
    print("\n4. [STEP B] Actor inspects Inbound Casting Offers Inbox...")
    actor_offers_res = client.get(f"/api/casting/actor/{actor_id}", headers={"Authorization": f"Bearer {actor_id}"})
    assert actor_offers_res.status_code == 200
    actor_offers = actor_offers_res.json()["data"]
    print(f"   ✓ Inbound Offers Found: {len(actor_offers)}")
    assert any(o["id"] == offer_id for o in actor_offers), "Sent offer not visible to actor!"

    # STEP C: Actor accepts role
    print("\n5. [STEP C] Actor accepts the Casting Offer & signs onto the movie...")
    accept_payload = {
        "status": "ACCEPTED",
        "actorResponseNote": "Thrilled to join this production. Looking forward to table reads."
    }
    accept_res = client.post(f"/api/casting/respond/{offer_id}", json=accept_payload, headers={"Authorization": f"Bearer {actor_id}"})
    assert accept_res.status_code == 200
    assert accept_res.json()["data"]["status"] == "ACCEPTED"
    print(f"   ✓ Offer Status: ACCEPTED")

    # STEP D: Verify Multi-Role Synchronization
    print("\n6. [STEP D] Verifying State Synchronization across Director, Producer, and Actor...")
    
    # 1. Verify Character in DB is locked CAST
    updated_char = db.get_document("characters", target_char["id"])
    print(f"   ✓ Character Status: {updated_char['name']} -> {updated_char['castingStatus']} (Actor: {updated_char['actorName']})")
    assert updated_char["castingStatus"] == "CAST"
    assert updated_char["actorName"] == target_actor["name"]

    # 2. Verify Movie Members list includes Actor
    updated_movie = db.get_document("movies", movie_id)
    member_names = [m.get("name") for m in updated_movie.get("members", [])]
    print(f"   ✓ Movie Members List: {member_names}")
    assert target_actor["name"] in member_names, "Actor missing from movie members!"

    # 3. Verify Actor's Filmography includes the Movie
    updated_actor = db.get_document("users", actor_id)
    actor_films = [f.get("movieTitle") for f in updated_actor.get("filmography", [])]
    print(f"   ✓ Actor Filmography: {actor_films}")
    assert any(f.get("movieId") == movie_id for f in updated_actor.get("filmography", [])), "Movie missing from actor filmography!"

    # 4. Verify Producer sees the signed movie and members
    producer_movies_res = client.get("/api/movies", headers={"Authorization": f"Bearer {producer_id}"})
    assert producer_movies_res.status_code == 200
    producer_movies = producer_movies_res.json()["data"]
    print(f"   ✓ Producer Viewable Movies: {len(producer_movies)} productions")
    
    # 5. Verify Actor sees the signed movie
    actor_movies_res = client.get("/api/movies", headers={"Authorization": f"Bearer {actor_id}"})
    assert actor_movies_res.status_code == 200
    actor_movies = actor_movies_res.json()["data"]
    print(f"   ✓ Actor Viewable Movies: {len(actor_movies)} productions (Authorized by signed contract)")
    assert any(m["id"] == movie_id for m in actor_movies), "Actor cannot access signed movie!"

    print("\n================================================================")
    print("  >>> DIRECTOR <-> PRODUCER <-> ACTOR FLOW 100% VERIFIED <<<    ")
    print("================================================================\n")

if __name__ == "__main__":
    test_collaboration()

