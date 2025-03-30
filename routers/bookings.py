from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.database import get_db
from ..models.models import Booking, Computer, User
from ..schemas.schemas import Booking as BookingSchema
from ..schemas.schemas import BookingCreate
from sqlalchemy import select
from datetime import datetime

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.get("/", response_model=List[BookingSchema])
async def get_bookings(db: AsyncSession = Depends(get_db)):
    """Получить список всех бронирований"""
    result = await db.execute(select(Booking))
    bookings = result.scalars().all()
    return bookings

@router.get("/user/{user_id}", response_model=List[BookingSchema])
async def get_user_bookings(user_id: int, db: AsyncSession = Depends(get_db)):
    """Получить бронирования конкретного пользователя"""
    result = await db.execute(select(Booking).filter(Booking.user_id == user_id))
    bookings = result.scalars().all()
    return bookings

@router.post("/", response_model=BookingSchema)
async def create_booking(booking: BookingCreate, user_id: int, db: AsyncSession = Depends(get_db)):
    """Создать новое бронирование"""
    # Проверяем доступность компьютера
    result = await db.execute(
        select(Booking).filter(
            Booking.computer_id == booking.computer_id,
            Booking.status == "active",
            Booking.start_time < booking.end_time,
            Booking.end_time > booking.start_time
        )
    )
    existing_booking = result.scalar_one_or_none()
    if existing_booking:
        raise HTTPException(status_code=400, detail="Компьютер уже забронирован на это время")

    # Проверяем баланс пользователя
    user_result = await db.execute(select(User).filter(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    computer_result = await db.execute(select(Computer).filter(Computer.id == booking.computer_id))
    computer = computer_result.scalar_one_or_none()
    if not computer:
        raise HTTPException(status_code=404, detail="Компьютер не найден")

    # Рассчитываем стоимость
    hours = (booking.end_time - booking.start_time).total_seconds() / 3600
    cost = hours * computer.hourly_rate

    if user.balance < cost:
        raise HTTPException(status_code=400, detail="Недостаточно средств")

    # Создаем бронирование
    db_booking = Booking(
        **booking.dict(),
        user_id=user_id,
        status="active"
    )
    
    # Списываем средства
    user.balance -= cost
    
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    
    return db_booking

@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    """Отменить бронирование"""
    result = await db.execute(select(Booking).filter(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")
    
    if booking.status != "active":
        raise HTTPException(status_code=400, detail="Бронирование уже завершено или отменено")
    
    if booking.start_time < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Нельзя отменить начавшееся бронирование")
    
    booking.status = "cancelled"
    
    # Возвращаем средства пользователю
    user_result = await db.execute(select(User).filter(User.id == booking.user_id))
    user = user_result.scalar_one_or_none()
    
    computer_result = await db.execute(select(Computer).filter(Computer.id == booking.computer_id))
    computer = computer_result.scalar_one_or_none()
    
    hours = (booking.end_time - booking.start_time).total_seconds() / 3600
    refund = hours * computer.hourly_rate
    
    user.balance += refund
    
    await db.commit()
    return {"status": "success"} 