from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import datetime

class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"

class ComputerStatus(enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")

class Computer(Base):
    __tablename__ = "computers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    status = Column(Enum(ComputerStatus), default=ComputerStatus.AVAILABLE)
    specs = Column(String)
    hourly_rate = Column(Float)
    
    bookings = relationship("Booking", back_populates="computer")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    computer_id = Column(Integer, ForeignKey("computers.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String)  # active, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="bookings")
    computer = relationship("Computer", back_populates="bookings")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    type = Column(String)  # deposit, withdrawal, booking
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions") 