from typing import List, Optional
from pydantic import BaseModel

class ScheduleItemCreate(BaseModel):
    movieId: str
    sceneId: Optional[str] = None
    sceneNumber: Optional[int] = None
    title: str
    shootingDate: str # YYYY-MM-DD
    startTime: str # HH:MM
    endTime: str # HH:MM
    location: str
    setting: str = "EXT" # INT / EXT
    charactersNeeded: List[str] = []
    equipmentNeeded: List[str] = []
    propsNeeded: List[str] = []
    status: str = "SCHEDULED" # SCHEDULED, COMPLETED, DELAYED, CANCELLED
    weatherRiskLevel: Optional[str] = "LOW" # LOW, MEDIUM, HIGH
    notes: Optional[str] = None

class ScheduleItemResponse(ScheduleItemCreate):
    id: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class BudgetCategory(BaseModel):
    category: str # Above The Line, Production, Post Production, Marketing, Logistics
    allocated: float
    spent: float
    notes: Optional[str] = None

class BudgetSchema(BaseModel):
    movieId: str
    totalBudget: float
    currency: str = "USD"
    categories: List[BudgetCategory] = []

class ExpenseCreate(BaseModel):
    movieId: str
    category: str
    department: str
    description: str
    amount: float
    date: str
    vendor: Optional[str] = None
    approvedBy: Optional[str] = None
    status: str = "APPROVED" # PENDING, APPROVED, REJECTED
    receiptUrl: Optional[str] = None

class ExpenseResponse(ExpenseCreate):
    id: str
    createdAt: Optional[str] = None

class DepartmentCreate(BaseModel):
    movieId: str
    name: str # Art & Set, Costume, Makeup & Hair, Catering, Transport, Locations, Equipment, VFX, Post-Production
    headOfDepartment: str
    headContact: Optional[str] = None
    teamCount: int = 1
    budgetAllocated: float = 0.0
    budgetSpent: float = 0.0
    status: str = "ON_TRACK" # ON_TRACK, AT_RISK, DELAYED
    taskSummary: Optional[str] = None

class DepartmentResponse(DepartmentCreate):
    id: str
    updatedAt: Optional[str] = None

class ResourceCreate(BaseModel):
    movieId: str
    category: str # Props, Equipment, Vehicles, Assets
    name: str
    quantity: int = 1
    department: str
    assignedToScene: Optional[int] = None
    status: str = "AVAILABLE" # AVAILABLE, IN_USE, RETURNED, DAMAGED
    dailyCost: Optional[float] = 0.0
    supplier: Optional[str] = None

class ResourceResponse(ResourceCreate):
    id: str
    createdAt: Optional[str] = None

class RiskCreate(BaseModel):
    movieId: str
    title: str
    category: str # Weather, Budget, Schedule, Technical, Cast/Crew
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    description: str
    mitigationStrategy: str
    status: str = "IDENTIFIED" # IDENTIFIED, MITIGATED, RESOLVED

class RiskResponse(RiskCreate):
    id: str
    createdAt: Optional[str] = None
