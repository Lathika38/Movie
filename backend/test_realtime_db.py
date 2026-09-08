import json
import os
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

def test_realtime_database_persistence():
    print("--- Testing Real-Time Backend Database Persistence ---")

    # 1. Fetch movies from API
    res = client.get("/api/movies")
    assert res.status_code == 200
    movies = res.json()["data"]
    assert len(movies) > 0
    movie_id = movies[0]["id"]

    # 2. Add an expense via API (POST /api/producer/expenses)
    expense_data = {
        "movieId": movie_id,
        "category": "Production & Camera",
        "department": "Camera & Grip",
        "description": "Real-time ARRI Alexa Lens Package Rental",
        "amount": 12500.0,
        "date": "2026-09-05",
        "vendor": "Panavision Rentals",
        "approvedBy": "Test Producer"
    }

    res_exp = client.post("/api/producer/expenses", json=expense_data)
    assert res_exp.status_code == 200
    created_expense = res_exp.json()["data"]
    exp_id = created_expense["id"]
    print(" PASS: Posted expense via API. Returned ID:", exp_id)

    # 3. Directly check database layer to verify real-time persistence
    doc = db.get_document("expenses", exp_id)
    assert doc is not None, "Expense MUST be immediately readable from database!"
    assert doc["description"] == "Real-time ARRI Alexa Lens Package Rental"
    assert doc["amount"] == 12500.0
    print(" PASS: Document is persisted in database layer immediately in real time!")

    # 4. Fetch budget breakdown via API and verify updated spent budget
    res_budget = client.get(f"/api/producer/budget-breakdown/{movie_id}")
    assert res_budget.status_code == 200
    budget_data = res_budget.json()["data"]
    cat_spent = next((c["spent"] for c in budget_data["categories"] if c["category"] == "Production & Camera"), 0)
    assert cat_spent >= 12500.0, f"Expected spent budget >= 12500, got {cat_spent}"
    print(f" PASS: Real-time budget breakdown updated. Production & Camera spent = ${cat_spent:,.2f}")

    # 5. Clean up test expense record
    db.delete_document("expenses", exp_id)
    assert db.get_document("expenses", exp_id) is None
    print(" PASS: Deleted test expense. Real-time removal verified.")

    print("\n REAL-TIME DATABASE PERSISTENCE VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_realtime_database_persistence()
