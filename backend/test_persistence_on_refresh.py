import requests

BASE = 'http://localhost:8000/api'

def main():
    # 1. Fetch movies list
    res = requests.get(f'{BASE}/movies')
    assert res.status_code == 200
    movies = res.json()['data']
    movie = movies[0]
    movie_id = movie['id']
    print(f'Testing Persistence on Refresh for Movie: "{movie["title"]}" ({movie_id})')

    # 2. Get scenes for this movie
    s_res = requests.get(f'{BASE}/scripts/scenes/{movie_id}')
    assert s_res.status_code == 200
    scenes = s_res.json()['data']
    assert len(scenes) > 0, "Movie must have scenes"
    target_scene = scenes[0]
    scene_id = target_scene['id']
    original_heading = target_scene['heading']
    print(f'Original Scene Heading: "{original_heading}"')

    # 3. Perform edit on scene
    new_heading = f'INT. RE-SYNC TEST LAB - NIGHT ({scene_id[:4]})'
    up_res = requests.put(f'{BASE}/scripts/scenes/{scene_id}', json={
        'heading': new_heading,
        'location': 'Re-Sync Testing Chamber'
    })
    assert up_res.status_code == 200
    print(f'PASS: Updated scene in database via PUT /api/scripts/scenes/{scene_id}')

    # 4. Simulate Page Refresh (GET scenes with user_id parameter)
    refresh_res = requests.get(f'{BASE}/scripts/scenes/{movie_id}?user_id=USR-PROD-001')
    assert refresh_res.status_code == 200
    refreshed_scenes = refresh_res.json()['data']
    found_scene = next((s for s in refreshed_scenes if s['id'] == scene_id), None)
    assert found_scene is not None, "Scene should be found on refresh"
    assert found_scene['heading'] == new_heading, f"Expected {new_heading}, got {found_scene['heading']}"
    print(f'PASS: On page refresh, scene data is persisted! Heading = "{found_scene["heading"]}"')

    # Restore original heading
    requests.put(f'{BASE}/scripts/scenes/{scene_id}', json={'heading': original_heading})
    print('PASS: Restored original scene heading.')

    print('\nALL PERSISTENCE ON REFRESH TESTS PASSED PERFECTLY!')

if __name__ == '__main__':
    main()
