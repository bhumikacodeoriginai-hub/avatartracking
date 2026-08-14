"""API v1 router - combines all endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, visitors, employees, departments
from app.api.v1.endpoints import courses, leads, appointments
from app.api.v1.endpoints import ai, cv, knowledge, notifications
from app.api.v1.endpoints import analytics, settings as settings_ep, audit

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Core resources
api_router.include_router(visitors.router, prefix="/visitors", tags=["Visitors"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])

# Business
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])

# AI & CV
api_router.include_router(ai.router, prefix="/ai", tags=["AI / Conversation"])
api_router.include_router(cv.router, prefix="/cv", tags=["Computer Vision"])

# Knowledge & Notifications
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge Base"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# Admin
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(settings_ep.router, prefix="/settings", tags=["Settings"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
