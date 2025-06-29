#!/bin/bash

echo "🚀 Запуск Canvas Event Sourcing Application"

# Проверяем, установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

# Проверяем, установлен ли Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Пожалуйста, установите Node.js 18+."
    exit 1
fi

echo "📦 Запуск PostgreSQL..."
docker-compose up -d postgres

echo "⏳ Ожидание запуска PostgreSQL..."
sleep 5

echo "📦 Установка зависимостей..."
npm run install:all

echo "🔧 Запуск приложения..."
npm run dev

echo "✅ Приложение запущено!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:3000"
echo ""
echo "Для остановки нажмите Ctrl+C" 