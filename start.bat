@echo off

REM Запуск бэкенда
echo Starting backend...
cd backend
pip install -r requirements.txt
start cmd /k "uvicorn main:app --reload --port 8000"
cd ..

REM Запуск фронтенда
echo Starting frontend...
cd frontend
npm install
npm start 