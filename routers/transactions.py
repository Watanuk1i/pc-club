from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.database import get_db
from ..models.models import Transaction, User
from ..schemas.schemas import Transaction as TransactionSchema
from ..schemas.schemas import TransactionCreate
from sqlalchemy import select

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/user/{user_id}", response_model=List[TransactionSchema])
async def get_user_transactions(user_id: int, db: AsyncSession = Depends(get_db)):
    """Получить все транзакции пользователя"""
    result = await db.execute(select(Transaction).filter(Transaction.user_id == user_id))
    transactions = result.scalars().all()
    return transactions

@router.post("/deposit", response_model=TransactionSchema)
async def create_deposit(
    user_id: int,
    amount: float,
    db: AsyncSession = Depends(get_db)
):
    """Создать транзакцию пополнения баланса"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Сумма должна быть положительной")

    # Находим пользователя
    user_result = await db.execute(select(User).filter(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Создаем транзакцию
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        type="deposit",
        description="Пополнение баланса"
    )
    
    # Обновляем баланс пользователя
    user.balance += amount
    
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    return transaction

@router.post("/withdrawal", response_model=TransactionSchema)
async def create_withdrawal(
    user_id: int,
    amount: float,
    db: AsyncSession = Depends(get_db)
):
    """Создать транзакцию списания средств"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Сумма должна быть положительной")

    # Находим пользователя
    user_result = await db.execute(select(User).filter(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Проверяем достаточно ли средств
    if user.balance < amount:
        raise HTTPException(status_code=400, detail="Недостаточно средств")

    # Создаем транзакцию
    transaction = Transaction(
        user_id=user_id,
        amount=-amount,
        type="withdrawal",
        description="Списание средств"
    )
    
    # Обновляем баланс пользователя
    user.balance -= amount
    
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    return transaction 