"""Security utilities - JWT, password hashing, permissions."""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Get current authenticated user from JWT token."""
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return {"user_id": user_id, "role": payload.get("role"), "email": payload.get("email")}


# Role-based access control
ROLE_PERMISSIONS = {
    "super_admin": ["*"],  # All permissions
    "admin": [
        "manage_users", "manage_employees", "manage_departments",
        "manage_courses", "manage_knowledge", "manage_settings",
        "view_analytics", "manage_visitors", "manage_leads",
        "manage_appointments", "view_audit_logs", "manage_consent",
    ],
    "hr": [
        "view_employees", "manage_job_applications",
        "manage_internship_applications", "view_visitors",
        "view_leads", "send_notifications",
    ],
    "reception": [
        "view_visitors", "manage_visitors", "view_employees",
        "view_appointments", "send_notifications", "view_leads",
    ],
    "admissions": [
        "view_visitors", "manage_course_enquiries",
        "view_courses", "manage_leads", "send_notifications",
    ],
    "trainer": [
        "view_courses", "view_batches", "view_students",
    ],
    "counsellor": [
        "view_visitors", "manage_leads", "view_courses",
        "manage_course_enquiries", "send_notifications",
    ],
    "manager": [
        "view_employees", "view_visitors", "view_analytics",
        "view_leads", "manage_appointments", "send_notifications",
    ],
    "employee": [
        "view_own_profile", "view_own_visitors",
        "view_own_appointments", "view_own_notifications",
    ],
}


def check_permission(user_role: str, required_permission: str) -> bool:
    """Check if a role has a specific permission."""
    permissions = ROLE_PERMISSIONS.get(user_role, [])
    return "*" in permissions or required_permission in permissions


def require_permission(permission: str):
    """Dependency to require a specific permission."""
    async def permission_checker(current_user: dict = Depends(get_current_user)):
        if not check_permission(current_user["role"], permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}",
            )
        return current_user
    return permission_checker
