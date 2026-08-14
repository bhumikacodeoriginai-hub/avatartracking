"""Database models."""
from app.models.user import User
from app.models.employee import Employee
from app.models.department import Department
from app.models.visitor import Visitor, VisitorSession, VisitorConsent, VisitorInteraction
from app.models.appointment import Appointment
from app.models.course import Course, CourseBatch, CourseEnquiry
from app.models.application import InternshipApplication, JobApplication
from app.models.lead import Lead, LeadFollowup
from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.models.settings import SystemSetting

__all__ = [
    "User", "Employee", "Department",
    "Visitor", "VisitorSession", "VisitorConsent", "VisitorInteraction",
    "Appointment", "Course", "CourseBatch", "CourseEnquiry",
    "InternshipApplication", "JobApplication",
    "Lead", "LeadFollowup",
    "KnowledgeDocument", "KnowledgeChunk",
    "Notification", "AuditLog", "SystemSetting",
]
