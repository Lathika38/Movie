import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import db
from app.core.security import get_current_user
from app.api.movies import is_user_authorized_for_movie
from app.agents.gemini_service import gemini_service
from app.schemas.producer import (
    ScheduleItemCreate, ScheduleItemResponse,
    ExpenseCreate, ExpenseResponse,
    DepartmentCreate, DepartmentResponse,
    ResourceCreate, ResourceResponse,
    RiskCreate, RiskResponse,
    BudgetSchema, BudgetCategory
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/producer", tags=["Producer Production Management"])

def _check_movie_access(movie_id: str, user: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    movie = db.get_document("movies", movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    user_id = user.get("id") if user else None
    if not is_user_authorized_for_movie(movie, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Only authorized production workspace members can access or modify this project."
        )
    return movie

# -------------------------------------------------------------
# SCHEDULES
# -------------------------------------------------------------
@router.get("/schedules/{movie_id}", response_model=ApiResponse[List[ScheduleItemResponse]])
def get_movie_schedules(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(movie_id, current_user)
    schedules = db.query_collection("schedules", filters=[("movieId", "==", movie_id)], order_by="shootingDate")
    return ApiResponse(success=True, data=[ScheduleItemResponse(**s) for s in schedules])

@router.post("/schedules", response_model=ApiResponse[ScheduleItemResponse])
def create_schedule_item(
    payload: ScheduleItemCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(payload.movieId, current_user)
    sched_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = sched_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("schedules", sched_id, data)
    return ApiResponse(success=True, message="Schedule created.", data=ScheduleItemResponse(**created))

@router.put("/schedules/{schedule_id}", response_model=ApiResponse[ScheduleItemResponse])
def update_schedule_item(
    schedule_id: str,
    updates: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    sched = db.get_document("schedules", schedule_id)
    if not sched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found.")
    _check_movie_access(sched.get("movieId"), current_user)
    updated = db.update_document("schedules", schedule_id, updates)
    return ApiResponse(success=True, message="Schedule updated.", data=ScheduleItemResponse(**updated))

@router.delete("/schedules/{schedule_id}", response_model=ApiResponse[bool])
def delete_schedule_item(
    schedule_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    sched = db.get_document("schedules", schedule_id)
    if not sched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found.")
    _check_movie_access(sched.get("movieId"), current_user)
    deleted = db.delete_document("schedules", schedule_id)
    return ApiResponse(success=True, message="Schedule deleted.", data=True)

# -------------------------------------------------------------
# EXPENSES & BUDGET
# -------------------------------------------------------------
@router.get("/expenses/{movie_id}", response_model=ApiResponse[List[ExpenseResponse]])
def get_movie_expenses(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(movie_id, current_user)
    expenses = db.query_collection("expenses", filters=[("movieId", "==", movie_id)], order_by="date", descending=True)
    return ApiResponse(success=True, data=[ExpenseResponse(**e) for e in expenses])

@router.post("/expenses", response_model=ApiResponse[ExpenseResponse])
def log_expense(
    payload: ExpenseCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(payload.movieId, current_user)
    exp_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = exp_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("expenses", exp_id, data)

    # Update department spent if matches
    deps = db.query_collection("departments", filters=[("movieId", "==", payload.movieId)])
    for d in deps:
        if d.get("name", "").lower() == payload.department.lower():
            current_spent = d.get("budgetSpent", 0.0)
            db.update_document("departments", d["id"], {"budgetSpent": current_spent + payload.amount})

    return ApiResponse(success=True, message="Expense recorded successfully.", data=ExpenseResponse(**created))

@router.put("/expenses/{expense_id}", response_model=ApiResponse[ExpenseResponse])
def update_expense(
    expense_id: str,
    updates: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    exp = db.get_document("expenses", expense_id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")
    _check_movie_access(exp.get("movieId"), current_user)
    updated = db.update_document("expenses", expense_id, updates)
    return ApiResponse(success=True, message="Expense updated successfully.", data=ExpenseResponse(**updated))

@router.delete("/expenses/{expense_id}", response_model=ApiResponse[bool])
def delete_expense(
    expense_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    exp = db.get_document("expenses", expense_id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")
    _check_movie_access(exp.get("movieId"), current_user)
    
    # Decrement department spent if matched
    deps = db.query_collection("departments", filters=[("movieId", "==", exp.get("movieId"))])
    for d in deps:
        if d.get("name", "").lower() == exp.get("department", "").lower():
            current_spent = d.get("budgetSpent", 0.0)
            new_spent = max(0.0, current_spent - exp.get("amount", 0.0))
            db.update_document("departments", d["id"], {"budgetSpent": new_spent})

    deleted = db.delete_document("expenses", expense_id)
    return ApiResponse(success=True, message="Expense deleted successfully.", data=True)

@router.get("/budget-breakdown/{movie_id}", response_model=ApiResponse[BudgetSchema])
def get_budget_breakdown(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_movie_access(movie_id, current_user)
    total_budget = movie.get("budget", 1000000.0)
    expenses = db.query_collection("expenses", filters=[("movieId", "==", movie_id)])

    categories_config = [
        {"category": "Above The Line", "pct": 0.30},
        {"category": "Production & Camera", "pct": 0.35},
        {"category": "Art, Costume & Makeup", "pct": 0.15},
        {"category": "Post-Production & VFX", "pct": 0.12},
        {"category": "Contingency & Logistics", "pct": 0.08},
    ]

    cats = []
    for c in categories_config:
        allocated = total_budget * c["pct"]
        spent = sum(e.get("amount", 0.0) for e in expenses if e.get("category", "").lower() == c["category"].lower())
        cats.append(BudgetCategory(
            category=c["category"],
            allocated=allocated,
            spent=spent,
            notes=f"{int(c['pct']*100)}% of total production fund"
        ))

    return ApiResponse(success=True, data=BudgetSchema(
        movieId=movie_id,
        totalBudget=total_budget,
        currency="USD",
        categories=cats
    ))

# -------------------------------------------------------------
# DEPARTMENTS
# -------------------------------------------------------------
@router.get("/departments/{movie_id}", response_model=ApiResponse[List[DepartmentResponse]])
def get_movie_departments(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(movie_id, current_user)
    deps = db.query_collection("departments", filters=[("movieId", "==", movie_id)])
    return ApiResponse(success=True, data=[DepartmentResponse(**d) for d in deps])

@router.post("/departments", response_model=ApiResponse[DepartmentResponse])
def create_department(
    payload: DepartmentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(payload.movieId, current_user)
    dep_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = dep_id
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("departments", dep_id, data)
    return ApiResponse(success=True, message="Department added.", data=DepartmentResponse(**created))

@router.put("/departments/{dep_id}", response_model=ApiResponse[DepartmentResponse])
def update_department(
    dep_id: str,
    updates: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    dep = db.get_document("departments", dep_id)
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")
    _check_movie_access(dep.get("movieId"), current_user)
    updated = db.update_document("departments", dep_id, updates)
    return ApiResponse(success=True, message="Department updated.", data=DepartmentResponse(**updated))

@router.delete("/departments/{dep_id}", response_model=ApiResponse[bool])
def delete_department(
    dep_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    dep = db.get_document("departments", dep_id)
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")
    _check_movie_access(dep.get("movieId"), current_user)
    deleted = db.delete_document("departments", dep_id)
    return ApiResponse(success=True, message="Department deleted.", data=True)

# -------------------------------------------------------------
# RESOURCES
# -------------------------------------------------------------
@router.get("/resources/{movie_id}", response_model=ApiResponse[List[ResourceResponse]])
def get_movie_resources(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(movie_id, current_user)
    res = db.query_collection("resources", filters=[("movieId", "==", movie_id)])
    return ApiResponse(success=True, data=[ResourceResponse(**r) for r in res])

@router.post("/resources", response_model=ApiResponse[ResourceResponse])
def create_resource(
    payload: ResourceCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(payload.movieId, current_user)
    res_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = res_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("resources", res_id, data)
    return ApiResponse(success=True, message="Resource recorded.", data=ResourceResponse(**created))

@router.put("/resources/{res_id}", response_model=ApiResponse[ResourceResponse])
def update_resource(
    res_id: str,
    updates: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    r = db.get_document("resources", res_id)
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    _check_movie_access(r.get("movieId"), current_user)
    updated = db.update_document("resources", res_id, updates)
    return ApiResponse(success=True, message="Resource updated.", data=ResourceResponse(**updated))

# -------------------------------------------------------------
# RISKS
# -------------------------------------------------------------
@router.get("/risks/{movie_id}", response_model=ApiResponse[List[RiskResponse]])
def get_movie_risks(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(movie_id, current_user)
    risks = db.query_collection("risks", filters=[("movieId", "==", movie_id)])
    return ApiResponse(success=True, data=[RiskResponse(**r) for r in risks])

@router.post("/risks", response_model=ApiResponse[RiskResponse])
def log_risk(
    payload: RiskCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    _check_movie_access(payload.movieId, current_user)
    r_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = r_id
    data["createdAt"] = datetime.now(timezone.utc).isoformat()
    created = db.set_document("risks", r_id, data)
    return ApiResponse(success=True, message="Risk registered.", data=RiskResponse(**created))

# -------------------------------------------------------------
# PRODUCER AI ASSISTANT: ANALYZE & FIX SCHEDULES, BUDGET & LEDGER, DEPARTMENTS
# -------------------------------------------------------------
@router.post("/ai-generate-and-fix/{movie_id}", response_model=ApiResponse[dict])
def ai_generate_and_fix_producer_data(
    movie_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    movie = _check_movie_access(movie_id, current_user)

    scenes = db.query_collection("scenes", filters=[("movieId", "==", movie_id)], order_by="sceneNumber")
    total_budget = movie.get("budget", 5000000.0)
    title = movie.get("title", "Film Production")
    genre = movie.get("genre", "Drama")

    prompt = f"""
    You are an executive line producer AI.
    Analyze this movie project and fix/generate the production schedules, department budgets, and ledger line items.
    Title: '{title}'
    Genre: '{genre}'
    Budget: ${total_budget:,.2f}
    Total Scenes: {len(scenes)}
    Logline: {movie.get('logline', '')}

    Generate a structured JSON object containing:
    1. 'schedules': list of 4 to 6 shooting call sheets with: 'title', 'shootingDate' (YYYY-MM-DD), 'startTime', 'endTime', 'location', 'setting' ('INT' or 'EXT'), 'weatherRiskLevel' ('LOW', 'MEDIUM', or 'HIGH'), 'status' ('SCHEDULED'), 'notes'
    2. 'departments': list of 5 key departments ('Camera & Grip', 'Sound & Audio', 'Art & Set Design', 'Costume & Makeup', 'Post-Production & VFX') with: 'name', 'headOfDepartment', 'budgetAllocated' (float), 'budgetSpent' (float), 'teamCount' (int), 'status' ('ACTIVE'), 'taskSummary'
    3. 'expenses': list of 4 to 6 ledger expense entries with: 'description', 'category', 'department', 'amount' (float), 'date' (YYYY-MM-DD), 'vendor', 'status' ('APPROVED')
    """

    system_instruction = "You are a movie production line producer AI. Respond ONLY with a valid JSON object."
    ai_raw = gemini_service._call_gemini_text(system_instruction, prompt)
    
    parsed = None
    if ai_raw:
        try:
            cleaned = ai_raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
            parsed = json.loads(cleaned.strip())
        except Exception as err:
            print("[AI Generate Producer Data Parsing Error]:", err)

    if not parsed or not isinstance(parsed, dict):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Producer AI Assistant analysis unavailable. Check Gemini service configuration and try again."
        )

    # Save to database only when valid AI parsed result exists
    created_schedules = []
    for s_item in parsed.get("schedules", []):
        sch_id = str(uuid.uuid4())
        s_item["id"] = sch_id
        s_item["movieId"] = movie_id
        s_item["createdAt"] = datetime.now(timezone.utc).isoformat()
        db.set_document("schedules", sch_id, s_item)
        created_schedules.append(s_item)

    created_departments = []
    for d_item in parsed.get("departments", []):
        dep_id = str(uuid.uuid4())
        d_item["id"] = dep_id
        d_item["movieId"] = movie_id
        d_item["updatedAt"] = datetime.now(timezone.utc).isoformat()
        db.set_document("departments", dep_id, d_item)
        created_departments.append(d_item)

    created_expenses = []
    for e_item in parsed.get("expenses", []):
        exp_id = str(uuid.uuid4())
        e_item["id"] = exp_id
        e_item["movieId"] = movie_id
        e_item["createdAt"] = datetime.now(timezone.utc).isoformat()
        db.set_document("expenses", exp_id, e_item)
        created_expenses.append(e_item)

    return ApiResponse(
        success=True,
        message=f"Producer AI Assistant successfully analyzed '{title}' and updated production schedules, budget, & department ledger!",
        data={
            "schedules": created_schedules,
            "departments": created_departments,
            "expenses": created_expenses
        }
    )

