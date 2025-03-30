from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.database import get_db
from ..models.models import User, UserRole
from ..schemas.schemas import User as UserSchema
from sqlalchemy import select

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserSchema])
async def get_users(db: AsyncSession = Depends(get_db)):
    """Получить список всех пользователей"""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Получить информацию о конкретном пользователе"""
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.put("/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: UserRole,
    db: AsyncSession = Depends(get_db)
):
    """Обновить роль пользователя"""
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.role = role
    await db.commit()
    return {"status": "success"}

@router.get("/telegram/{telegram_id}", response_model=UserSchema)
async def get_user_by_telegram_id(telegram_id: int, db: AsyncSession = Depends(get_db)):
    """Получить пользователя по Telegram ID"""
    result = await db.execute(select(User).filter(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user 