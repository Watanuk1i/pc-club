from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import os
from dotenv import load_dotenv
from ..models.database import SessionLocal
from ..models.models import User, UserRole
from sqlalchemy import select

load_dotenv()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    # Проверяем, зарегистрирован ли пользователь
    async with SessionLocal() as db:
        result = await db.execute(
            select(User).filter(User.telegram_id == update.effective_user.id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Создаем нового пользователя
            user = User(
                telegram_id=update.effective_user.id,
                username=update.effective_user.username,
                full_name=update.effective_user.full_name,
                role=UserRole.USER
            )
            db.add(user)
            await db.commit()
    
    # Создаем кнопки с веб-приложением
    keyboard = [
        [InlineKeyboardButton(
            "🖥 Открыть PC Club App",
            web_app=WebAppInfo(url=f"{os.getenv('WEBAPP_URL')}"))
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Добро пожаловать в PC Club! Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=reply_markup
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /help"""
    help_text = """
Доступные команды:
/start - Открыть главное меню
/balance - Проверить баланс
/help - Показать это сообщение

Для бронирования компьютера используйте веб-приложение.
"""
    await update.message.reply_text(help_text)

async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /balance"""
    async with SessionLocal() as db:
        result = await db.execute(
            select(User).filter(User.telegram_id == update.effective_user.id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            await update.message.reply_text(
                f"Ваш текущий баланс: {user.balance:.2f} руб."
            )
        else:
            await update.message.reply_text(
                "Пользователь не найден. Используйте /start для регистрации."
            )

def create_application():
    """Создание и настройка приложения бота"""
    application = Application.builder().token(os.getenv("TELEGRAM_BOT_TOKEN")).build()
    
    # Регистрация обработчиков команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("balance", balance))
    
    return application 