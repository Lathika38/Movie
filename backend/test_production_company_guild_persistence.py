import requests

BASE = 'http://localhost:8000/api'

def main():
    # 1. Fetch user profile
    user_id = 'USR-PROD-001'
    res = requests.get(f'{BASE}/auth/me/{user_id}')
    assert res.status_code == 200, f'Status {res.status_code}'
    user_data = res.json()['data']
    print(f'Initial Profile for {user_data["name"]}: Company = "{user_data.get("productionCompany")}", Guild = "{user_data.get("guildStatus")}"')

    # 2. Update Production Company and Guild Status
    test_company = 'Paramount Apex Pictures Global'
    test_guild = 'PGA / WGA Executive Producer Guild'
    
    up_res = requests.put(f'{BASE}/auth/profile/{user_id}', json={
        'productionCompany': test_company,
        'guildStatus': test_guild
    })
    assert up_res.status_code == 200, f'Update failed {up_res.status_code}: {up_res.text}'
    print('PASS: Updated Production Company and Guild Status via PUT /api/auth/profile')

    # 3. Verify persistence via GET /api/auth/me/{user_id}
    check_res = requests.get(f'{BASE}/auth/me/{user_id}')
    assert check_res.status_code == 200
    updated_user = check_res.json()['data']
    assert updated_user.get('productionCompany') == test_company, f'Expected {test_company}, got {updated_user.get("productionCompany")}'
    assert updated_user.get('guildStatus') == test_guild, f'Expected {test_guild}, got {updated_user.get("guildStatus")}'
    
    print(f'PASS: Real-Time Database Verification: Company = "{updated_user.get("productionCompany")}", Guild = "{updated_user.get("guildStatus")}"')

    print('\nALL PRODUCTION COMPANY & GUILD PERSISTENCE TESTS PASSED PERFECTLY!')

if __name__ == '__main__':
    main()
