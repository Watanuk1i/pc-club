from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.database import get_db
from ..models.models import Computer, ComputerStatus
from ..schemas.schemas import Computer as ComputerSchema
from ..schemas.schemas import ComputerCreate
from sqlalchemy import select

router = APIRouter(prefix="/computers", tags=["computers"])

@router.get("/", response_model=List[ComputerSchema])
async def get_computers(db: AsyncSession = Depends(get_db)):
    """Получить список всех компьютеров"""
    result = await db.execute(select(Computer))
    computers = result.scalars().all()
    return computers

@router.get("/{computer_id}", response_model=ComputerSchema)
async def get_computer(computer_id: int, db: AsyncSession = Depends(get_db)):
    """Получить информацию о конкретном компьютере"""
    result = await db.execute(select(Computer).filter(Computer.id == computer_id))
    computer = result.scalar_one_or_none()
    if not computer:
        raise HTTPException(status_code=404, detail="Компьютер не найден")
    return computer

@router.post("/", response_model=ComputerSchema)
async def create_computer(computer: ComputerCreate, db: AsyncSession = Depends(get_db)):
    """Создать новый компьютер"""
    db_computer = Computer(**computer.dict())
    db.add(db_computer)
    await db.commit()
    await db.refresh(db_computer)
    return db_computer

@router.put("/{computer_id}/status")
async def update_computer_status(
    computer_id: int,
    status: ComputerStatus,
    db: AsyncSession = Depends(get_db)
):
    """Обновить статус компьютера"""
    result = await db.execute(select(Computer).filter(Computer.id == computer_id))
    computer = result.scalar_one_or_none()
    if not computer:
        raise HTTPException(status_code=404, detail="Компьютер не найден")
    
    computer.status = status
    await db.commit()
    return {"status": "success"} 