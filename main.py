import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bot.telegram_bot import create_application
from routers import computers, bookings, transactions, users
from models.database import engine, Base

# Создаем FastAPI приложение
app = FastAPI(
    title="PC Club API",
    description="API для управления компьютерным клубом через Telegram",
    version="1.0.0"
)

# Настраиваем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(users.router)
app.include_router(computers.router)
app.include_router(bookings.router)
app.include_router(transactions.router)

@app.on_event("startup")
async def startup():
    # Создаем таблицы в базе данных
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Запускаем бота
    bot_app = create_application()
    asyncio.create_task(bot_app.run_polling())

@app.get("/")
async def root():
    return {
        "message": "PC Club API is running",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 