from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

def test_movie_visibility_access_control():
    print("--- Testing Project Access Control & Offer/Contract Visibility ---")
    
    unauthorized_actor_id = "test-actor-no-access-999"
    req_id = "test-casting-req-888"

    # Clean up prior test runs if leftover
    db.delete_document("users", unauthorized_actor_id)
    db.delete_document("castingRequests", req_id)

    movies = db.query_collection("movies")
    assert len(movies) > 0, "No movies found in database."
    test_movie = movies[0]
    movie_id = test_movie["id"]

    try:
        # Create an actor with NO offer/contract for test_movie
        db.set_document("users", unauthorized_actor_id, {
            "id": unauthorized_actor_id,
            "name": "Unauthorized Actor",
            "email": "unauthorized@actor.com",
            "role": "ACTOR"
        })
        
        # Test GET /movies with user_id of unauthorized actor
        res = client.get(f"/api/movies?user_id={unauthorized_actor_id}")
        assert res.status_code == 200
        user_movies = res.json().get("data", [])
        user_movie_ids = [m["id"] for m in user_movies]
        assert movie_id not in user_movie_ids, "Unauthorized actor should NOT see unoffered/unsigned movie in movie list!"
        print(" PASS: Unauthorized actor cannot see unoffered movie in list.")
        
        # Test GET /movies/{movie_id} for unauthorized actor
        res_details = client.get(f"/api/movies/{movie_id}?user_id={unauthorized_actor_id}")
        assert res_details.status_code == 403, f"Expected 403 Forbidden for unauthorized actor, got {res_details.status_code}"
        print(" PASS: GET /movies/{movie_id} returned 403 Forbidden for unauthorized actor.")
        
        # Test GET /scripts/scenes/{movie_id} for unauthorized actor
        res_scenes = client.get(f"/api/scripts/scenes/{movie_id}?user_id={unauthorized_actor_id}")
        assert res_scenes.status_code == 200
        scenes_data = res_scenes.json().get("data", [])
        assert len(scenes_data) == 0, "Unauthorized actor should NOT receive scene breakdown!"
        print(" PASS: GET /scripts/scenes returned empty data for unauthorized actor.")
        
        # Now create a PENDING casting request for this actor
        db.set_document("castingRequests", req_id, {
            "id": req_id,
            "movieId": movie_id,
            "movieTitle": test_movie.get("title", "Test Movie"),
            "actorId": unauthorized_actor_id,
            "actorName": "Unauthorized Actor",
            "actorEmail": "unauthorized@actor.com",
            "characterId": "chr-1",
            "characterName": "Hero",
            "status": "PENDING"
        })
        
        # Re-test GET /movies with user_id - NOW the actor should see it (offered role)
        res_offered = client.get(f"/api/movies?user_id={unauthorized_actor_id}")
        assert res_offered.status_code == 200
        offered_movies = res_offered.json().get("data", [])
        offered_movie_ids = [m["id"] for m in offered_movies]
        assert movie_id in offered_movie_ids, "Actor WITH PENDING OFFER should be able to see the project!"
        print(" PASS: Actor with PENDING offer CAN see the project details.")
        
        # Re-test GET /movies/{movie_id} with user_id - SHOULD SUCCEED (200 OK)
        res_offered_details = client.get(f"/api/movies/{movie_id}?user_id={unauthorized_actor_id}")
        assert res_offered_details.status_code == 200, f"Expected 200 for offered actor, got {res_offered_details.status_code}"
        print(" PASS: GET /movies/{movie_id} returned 200 OK for offered actor.")
    finally:
        db.delete_document("users", unauthorized_actor_id)
        db.delete_document("castingRequests", req_id)
    
def test_director_producer_access_control():
    print("\n--- Testing Strict Director & Producer Project Access Isolation ---")
    
    dir_a_id = "test-dir-a-101"
    dir_b_id = "test-dir-b-102"
    prod_a_id = "test-prod-a-201"
    prod_b_id = "test-prod-b-202"

    db.set_document("users", dir_a_id, {"id": dir_a_id, "name": "Director Alpha", "role": "DIRECTOR", "email": "dir_a@movieos.ai"})
    db.set_document("users", dir_b_id, {"id": dir_b_id, "name": "Director Beta", "role": "DIRECTOR", "email": "dir_b@movieos.ai"})
    db.set_document("users", prod_a_id, {"id": prod_a_id, "name": "Producer Alpha", "role": "PRODUCER", "email": "prod_a@movieos.ai"})
    db.set_document("users", prod_b_id, {"id": prod_b_id, "name": "Producer Beta", "role": "PRODUCER", "email": "prod_b@movieos.ai"})

    # Create movie signed only by Producer Alpha & Director Alpha
    movie_id = "test-movie-project-555"
    db.set_document("movies", movie_id, {
        "id": movie_id,
        "title": "Alpha Project Secrets",
        "genre": "Thriller",
        "language": "English",
        "logline": "Top secret project for Alpha team only.",
        "producerId": prod_a_id,
        "producerName": "Producer Alpha",
        "directorId": dir_a_id,
        "directorName": "Director Alpha",
        "createdBy": prod_a_id,
        "status": "DEVELOPMENT",
        "budget": 5000000.0,
        "members": [
            {"userId": prod_a_id, "name": "Producer Alpha", "role": "PRODUCER"},
            {"userId": dir_a_id, "name": "Director Alpha", "role": "DIRECTOR"}
        ]
    })

    try:
        # 1. Director A (Signed) should see the project
        res_dir_a = client.get(f"/api/movies?user_id={dir_a_id}")
        assert res_dir_a.status_code == 200
        movies_a = [m["id"] for m in res_dir_a.json().get("data", [])]
        assert movie_id in movies_a, "Signed Director Alpha MUST see their movie project!"
        print(" PASS: Signed Director Alpha can view project in movie list.")

        # 2. Director B (Unsigned) must NOT see the project
        res_dir_b = client.get(f"/api/movies?user_id={dir_b_id}")
        assert res_dir_b.status_code == 200
        movies_b = [m["id"] for m in res_dir_b.json().get("data", [])]
        assert movie_id not in movies_b, "Unsigned Director Beta must NOT see Movie Project of Director Alpha!"
        print(" PASS: Unsigned Director Beta cannot see project in movie list.")

        # 3. Director B direct details GET attempt returns 403 Forbidden
        res_dir_b_det = client.get(f"/api/movies/{movie_id}?user_id={dir_b_id}")
        assert res_dir_b_det.status_code == 403, f"Expected 403 Forbidden for unsigned director, got {res_dir_b_det.status_code}"
        print(" PASS: GET /movies/{movie_id} returned 403 Forbidden for unsigned director.")

        # 4. Director B update attempt returns 403 Forbidden
        res_dir_b_put = client.put(f"/api/movies/{movie_id}?user_id={dir_b_id}", json={"title": "Hacked Title"})
        assert res_dir_b_put.status_code == 403, f"Expected 403 Forbidden on update, got {res_dir_b_put.status_code}"
        print(" PASS: PUT /movies/{movie_id} returned 403 Forbidden for unsigned director.")

        # 5. Director B delete attempt returns 403 Forbidden
        res_dir_b_del = client.delete(f"/api/movies/{movie_id}?user_id={dir_b_id}")
        assert res_dir_b_del.status_code == 403, f"Expected 403 Forbidden on delete, got {res_dir_b_del.status_code}"
        print(" PASS: DELETE /movies/{movie_id} returned 403 Forbidden for unsigned director.")

        # 6. Producer B (Unsigned) direct details GET attempt returns 403 Forbidden
        res_prod_b_det = client.get(f"/api/movies/{movie_id}?user_id={prod_b_id}")
        assert res_prod_b_det.status_code == 403
        print(" PASS: GET /movies/{movie_id} returned 403 Forbidden for unsigned producer.")

        # 7. Admin (USR-ADMIN-001) can access project details
        res_admin = client.get(f"/api/movies/{movie_id}?user_id=USR-ADMIN-001")
        assert res_admin.status_code == 200
        print(" PASS: Studio Chief Admin retains executive oversight.")

    finally:
        db.delete_document("users", dir_a_id)
        db.delete_document("users", dir_b_id)
        db.delete_document("users", prod_a_id)
        db.delete_document("users", prod_b_id)
        db.delete_document("movies", movie_id)

def test_producer_production_company_matching():
    print("\n--- Testing Producer Access Based on Registered Production Company Name ---")
    
    prod_apex_id = "test-prod-apex-301"
    prod_other_id = "test-prod-other-302"
    movie_apex_id = "test-movie-apex-777"

    # Register Producer 1 with Production Company "Apex Pictures"
    db.set_document("users", prod_apex_id, {
        "id": prod_apex_id,
        "name": "Producer Apex",
        "role": "PRODUCER",
        "email": "apex@producers.com",
        "productionCompany": "Apex Pictures"
    })

    # Register Producer 2 with Production Company "Universal Studios"
    db.set_document("users", prod_other_id, {
        "id": prod_other_id,
        "name": "Producer Universal",
        "role": "PRODUCER",
        "email": "universal@producers.com",
        "productionCompany": "Universal Studios"
    })

    # Create movie carrying productionCompany "Apex Pictures"
    db.set_document("movies", movie_apex_id, {
        "id": movie_apex_id,
        "title": "Apex Blockbuster",
        "genre": "Action",
        "language": "English",
        "logline": "High octane action film.",
        "productionCompany": "Apex Pictures",
        "status": "PRODUCTION",
        "budget": 20000000.0,
        "members": []
    })

    try:
        # 1. Producer with matching productionCompany ("Apex Pictures") CAN view the movie
        res_apex = client.get(f"/api/movies?user_id={prod_apex_id}")
        assert res_apex.status_code == 200
        movies_apex = [m["id"] for m in res_apex.json().get("data", [])]
        assert movie_apex_id in movies_apex, "Producer registered with 'Apex Pictures' MUST see movies carrying 'Apex Pictures'!"
        print(" PASS: Producer with matching production company name CAN view the movie in list.")

        # 2. Details GET for matching producer returns 200 OK
        res_apex_det = client.get(f"/api/movies/{movie_apex_id}?user_id={prod_apex_id}")
        assert res_apex_det.status_code == 200
        print(" PASS: GET /movies/{movie_id} returned 200 OK for matching production company producer.")

        # 3. Producer with mismatched productionCompany ("Universal Studios") cannot view movie
        res_other = client.get(f"/api/movies?user_id={prod_other_id}")
        assert res_other.status_code == 200
        movies_other = [m["id"] for m in res_other.json().get("data", [])]
        assert movie_apex_id not in movies_other, "Producer with 'Universal Studios' should NOT see 'Apex Pictures' movie!"
        print(" PASS: Producer with mismatched production company name cannot see the movie.")

        # 4. Details GET for mismatched producer returns 403 Forbidden
        res_other_det = client.get(f"/api/movies/{movie_apex_id}?user_id={prod_other_id}")
        assert res_other_det.status_code == 403
        print(" PASS: GET /movies/{movie_id} returned 403 Forbidden for mismatched production company producer.")

    finally:
        db.delete_document("users", prod_apex_id)
        db.delete_document("users", prod_other_id)
        db.delete_document("movies", movie_apex_id)

if __name__ == "__main__":
    test_movie_visibility_access_control()
    test_director_producer_access_control()
    test_producer_production_company_matching()
