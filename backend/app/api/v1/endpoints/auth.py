"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, get_current_user
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, LoginResponse, RefreshRequest,
    UserResponse, UserCreate, ChangePasswordRequest
)

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return tokens."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )
    
    # Create tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role.value if hasattr(user.role, 'value') else user.role,
            is_active=user.is_active,
        ),
    )


@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    """Refresh access token."""
    payload = decode_token(request.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    token_data = {
        "sub": payload["sub"],
        "email": payload["email"],
        "role": payload["role"],
    }
    new_access_token = create_access_token(token_data)
    
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client should discard tokens)."""
    # In production, add token to blacklist in Redis
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user profile."""
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        is_active=user.is_active,
    )


@router.post("/register", response_model=UserResponse)
async def register_user(
    request: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Register a new user (admin only)."""
    if current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Only admins can create users")
    
    # Check if email exists
    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        full_name=request.full_name,
        role=request.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        is_active=user.is_active,
    )
