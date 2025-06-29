@echo off
echo 🚀 Запуск Canvas Event Sourcing Application

REM Проверяем, установлен ли Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker не установлен. Пожалуйста, установите Docker.
    pause
    exit /b 1
)

REM Проверяем, установлен ли Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не установлен. Пожалуйста, установите Node.js 18+.
    pause
    exit /b 1
)

echo 📦 Запуск PostgreSQL...
docker-compose up -d postgres

echo ⏳ Ожидание запуска PostgreSQL...
timeout /t 5 /nobreak >nul

echo 📦 Установка зависимостей...
call npm run install:all

echo 🔧 Запуск приложения...
call npm run dev

echo ✅ Приложение запущено!
echo 🌐 Frontend: http://localhost:5173
echo 🔌 Backend: http://localhost:3000
echo.
echo Для остановки нажмите Ctrl+C
pause 