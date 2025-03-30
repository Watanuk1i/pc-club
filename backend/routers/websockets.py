from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict
from auth import get_current_user_ws
from schemas.user import User

router = APIRouter()

# Хранилище активных подключений
class ConnectionManager:
    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_notification(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except WebSocketDisconnect:
                self.disconnect(user_id)

manager = ConnectionManager()

@router.websocket("/ws/notifications")
async def websocket_endpoint(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user_ws)
):
    await manager.connect(websocket, current_user.id)
    try:
        while True:
            # Ждем сообщений от клиента для поддержания соединения
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(current_user.id)

# Функция для отправки уведомлений через WebSocket
async def send_notification_ws(user_id: int, notification_data: dict):
    await manager.send_notification(user_id, notification_data) 