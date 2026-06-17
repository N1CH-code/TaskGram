#!/bin/bash

echo "🚀 TaskGram - Установка и запуск"
echo "================================"
echo ""

# Check prerequisites
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ $1 не найден. Пожалуйста, установите $1"
    exit 1
  fi
  echo "✅ $1 найден"
}

check_command node
check_command npm

# Backend setup
echo ""
echo "📦 Установка backend..."
cd backend
npm install
echo ""

# Generate Prisma client
echo "🗄️  Генерация Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Запуск миграций..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Заполнение базы данных..."
npx prisma db seed

cd ..

# Frontend setup
echo ""
echo "📦 Установка frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Установка завершена!"
echo ""
echo "Запустите проект:"
echo "  cd backend && npm run start:dev  (Backend)"
echo "  cd frontend && npm run dev      (Frontend)"
echo ""
echo "Или через Docker:"
echo "  docker compose -f docker/docker-compose.yml up -d"
