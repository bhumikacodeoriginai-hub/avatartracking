"""Analytics endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, date, timedelta, timezone
from typing import Optional

from app.core.database import get_db
from app.core.security import require_permission
from app.models.visitor import Visitor, VisitorSession
from app.models.lead import Lead
from app.models.course import CourseEnquiry
from app.models.application import InternshipApplication, JobApplication
from app.models.appointment import Appointment

router = APIRouter()


@router.get("/overview")
async def dashboard_overview(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_analytics")),
):
    """Get dashboard overview statistics."""
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    week_start = today_start - timedelta(days=today.weekday())
    month_start = today_start.replace(day=1)
    
    # Today's visitors
    today_visitors = await db.execute(
        select(func.count(VisitorSession.id)).where(
            VisitorSession.started_at >= today_start
        )
    )
    
    # Total visitors
    total_visitors = await db.execute(select(func.count(Visitor.id)))
    
    # Active sessions
    active_sessions = await db.execute(
        select(func.count(VisitorSession.id)).where(
            VisitorSession.status == "active"
        )
    )
    
    # New leads today
    today_leads = await db.execute(
        select(func.count(Lead.id)).where(Lead.created_at >= today_start)
    )
    
    # Appointments today
    today_appointments = await db.execute(
        select(func.count(Appointment.id)).where(
            and_(
                Appointment.scheduled_at >= today_start,
                Appointment.scheduled_at < today_start + timedelta(days=1),
            )
        )
    )
    
    # Course enquiries this month
    month_enquiries = await db.execute(
        select(func.count(CourseEnquiry.id)).where(
            CourseEnquiry.created_at >= month_start
        )
    )
    
    # Job applications this month
    month_jobs = await db.execute(
        select(func.count(JobApplication.id)).where(
            JobApplication.created_at >= month_start
        )
    )
    
    # Internship applications this month
    month_internships = await db.execute(
        select(func.count(InternshipApplication.id)).where(
            InternshipApplication.created_at >= month_start
        )
    )
    
    return {
        "today": {
            "visitors": today_visitors.scalar() or 0,
            "leads": today_leads.scalar() or 0,
            "appointments": today_appointments.scalar() or 0,
            "active_sessions": active_sessions.scalar() or 0,
        },
        "totals": {
            "visitors": total_visitors.scalar() or 0,
        },
        "this_month": {
            "course_enquiries": month_enquiries.scalar() or 0,
            "job_applications": month_jobs.scalar() or 0,
            "internship_applications": month_internships.scalar() or 0,
        },
    }


@router.get("/visitors")
async def visitor_analytics(
    period: str = Query("week", regex="^(day|week|month|year)$"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_analytics")),
):
    """Get visitor analytics for a period."""
    today = date.today()
    
    if period == "day":
        start_date = datetime.combine(today, datetime.min.time())
    elif period == "week":
        start_date = datetime.combine(today - timedelta(days=7), datetime.min.time())
    elif period == "month":
        start_date = datetime.combine(today - timedelta(days=30), datetime.min.time())
    else:
        start_date = datetime.combine(today - timedelta(days=365), datetime.min.time())
    
    # Visitor count per day
    daily_visitors = await db.execute(
        select(
            func.date(VisitorSession.started_at).label("date"),
            func.count(VisitorSession.id).label("count"),
        ).where(VisitorSession.started_at >= start_date)
        .group_by(func.date(VisitorSession.started_at))
        .order_by(func.date(VisitorSession.started_at))
    )
    
    # New vs returning
    new_count = await db.execute(
        select(func.count(Visitor.id)).where(
            and_(Visitor.first_visit >= start_date, Visitor.visit_count == 1)
        )
    )
    returning_count = await db.execute(
        select(func.count(Visitor.id)).where(
            and_(Visitor.last_visit >= start_date, Visitor.visit_count > 1)
        )
    )
    
    # By type
    by_type = await db.execute(
        select(Visitor.profile_type, func.count(Visitor.id))
        .where(Visitor.last_visit >= start_date)
        .group_by(Visitor.profile_type)
    )
    
    return {
        "period": period,
        "daily": [{"date": str(r[0]), "count": r[1]} for r in daily_visitors.all()],
        "new_visitors": new_count.scalar() or 0,
        "returning_visitors": returning_count.scalar() or 0,
        "by_type": dict(by_type.all()),
    }


@router.get("/leads")
async def lead_analytics(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("view_analytics")),
):
    """Get lead analytics."""
    today = date.today()
    
    if period == "week":
        start_date = datetime.combine(today - timedelta(days=7), datetime.min.time())
    elif period == "month":
        start_date = datetime.combine(today - timedelta(days=30), datetime.min.time())
    elif period == "quarter":
        start_date = datetime.combine(today - timedelta(days=90), datetime.min.time())
    else:
        start_date = datetime.combine(today - timedelta(days=365), datetime.min.time())
    
    # By status
    by_status = await db.execute(
        select(Lead.status, func.count(Lead.id))
        .where(Lead.created_at >= start_date)
        .group_by(Lead.status)
    )
    
    # By category
    by_category = await db.execute(
        select(Lead.category, func.count(Lead.id))
        .where(Lead.created_at >= start_date)
        .group_by(Lead.category)
    )
    
    # Conversion rate
    total = await db.execute(
        select(func.count(Lead.id)).where(Lead.created_at >= start_date)
    )
    converted = await db.execute(
        select(func.count(Lead.id)).where(
            and_(Lead.created_at >= start_date, Lead.status == "converted")
        )
    )
    
    total_val = total.scalar() or 0
    converted_val = converted.scalar() or 0
    conversion_rate = (converted_val / total_val * 100) if total_val > 0 else 0
    
    return {
        "period": period,
        "total_leads": total_val,
        "converted": converted_val,
        "conversion_rate": round(conversion_rate, 1),
        "by_status": dict(by_status.all()),
        "by_category": dict(by_category.all()),
    }
