from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    type: str
    message: str
    user_id: int

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    read: bool

class NotificationResponse(NotificationBase):
    id: int
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True 