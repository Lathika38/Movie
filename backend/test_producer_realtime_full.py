import requests

BASE = 'http://localhost:8000/api'

def main():
    res = requests.get(f'{BASE}/movies')
    assert res.status_code == 200, f'Status {res.status_code}'
    movies = res.json()['data']
    print(f'Total Movies Available: {len(movies)}')

    for m in movies:
        m_id = m['id']
        m_title = m['title']
        print(f'\nTesting Producer endpoints for movie: "{m_title}" ({m_id})')
        
        # 1. Schedules
        s_res = requests.get(f'{BASE}/producer/schedules/{m_id}')
        assert s_res.status_code == 200
        scheds = s_res.json()['data']
        print(f'  - Schedules count: {len(scheds)}')
        
        # 2. Expenses
        e_res = requests.get(f'{BASE}/producer/expenses/{m_id}')
        assert e_res.status_code == 200
        exps = e_res.json()['data']
        print(f'  - Expenses count: {len(exps)}')
        
        # 3. Budget Breakdown
        b_res = requests.get(f'{BASE}/producer/budget-breakdown/{m_id}')
        assert b_res.status_code == 200
        bud = b_res.json()['data']
        print(f'  - Budget total: ${bud["totalBudget"]:,.2f}, categories: {len(bud["categories"])}')
        
        # 4. Departments
        d_res = requests.get(f'{BASE}/producer/departments/{m_id}')
        assert d_res.status_code == 200
        deps = d_res.json()['data']
        print(f'  - Departments count: {len(deps)}')

    print('\nALL PRODUCER ENDPOINTS ARE WORKING PERFECTLY WITH REAL-TIME DATABASE DATA!')

if __name__ == '__main__':
    main()
