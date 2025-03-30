from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class ComputerStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class UserBase(BaseModel):
    telegram_id: int
    username: str
    full_name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    role: UserRole
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True

class ComputerBase(BaseModel):
    name: str
    specs: str
    hourly_rate: float

class ComputerCreate(ComputerBase):
    pass

class Computer(ComputerBase):
    id: int
    status: ComputerStatus

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    computer_id: int
    start_time: datetime
    end_time: datetime

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    amount: float
    type: str
    description: str

class TransactionCreate(TransactionBase):
    user_id: int

class Transaction(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TelegramWebAppData(BaseModel):
    query_id: Optional[str]
    user: dict
    auth_date: int
    hash: str 