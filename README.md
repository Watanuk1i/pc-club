# PC Club Telegram Web App

Веб-приложение для управления компьютерным клубом через Telegram.

## Установка

1. Клонируйте репозиторий
2. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # для Linux/Mac
venv\Scripts\activate     # для Windows
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Скопируйте `.env.example` в `.env` и заполните необходимые переменные окружения:
```bash
cp .env.example .env
```

5. Запустите приложение:
```bash
uvicorn main:app --reload
```

## Структура проекта

```
├── main.py              # Основной файл приложения
├── database.py          # Настройки базы данных
├── models/             # Модели данных
├── routers/            # Маршруты API
├── services/           # Бизнес-логика
└── requirements.txt    # Зависимости проекта
``` 