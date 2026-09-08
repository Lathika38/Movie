import urllib.request
import json

base_url = "http://localhost:8000"

def check_endpoint(path):
    url = f"{base_url}{path}"
    try:
        req = urllib.request.urlopen(url)
        data = json.loads(req.read().decode('utf-8'))
        print(f"[OK] {path} -> {req.status} OK")
        return True, data
    except Exception as e:
        print(f"[ERROR] {path} -> Error: {e}")
        return False, None

def main():
    print("--- Checking Live Uvicorn Backend API (http://localhost:8000) ---")
    check_endpoint("/")
    check_endpoint("/api/health")
    check_endpoint("/api/movies")
    check_endpoint("/api/users")
    check_endpoint("/api/weather?location=Los%20Angeles")

if __name__ == "__main__":
    main()
