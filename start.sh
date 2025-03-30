#!/bin/bash

# Запуск бэкенда
echo "Starting backend..."
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
cd ..

# Запуск фронтенда
echo "Starting frontend..."
cd frontend
npm install
npm start 