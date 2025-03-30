#!/bin/bash

# Сборка фронтенда
echo "Building frontend..."
cd frontend
npm run build

# Копирование файлов на сервер (замените на ваши данные)
echo "Deploying to server..."
scp -r build/* user@your-server:/var/www/pc-club

# Очистка кэша
echo "Clearing cache..."
ssh user@your-server "sudo systemctl restart nginx"

echo "Deployment completed!" 