from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import notifications, websockets
from database import engine, Base

app = FastAPI()

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Замените на ваш фронтенд URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(notifications.router)
app.include_router(websockets.router)

# ... остальные роутеры ... 