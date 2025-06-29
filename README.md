# Canvas Event Sourcing Application

Full-stack приложение с Event Sourcing и историей версий, демонстрирующее работу архитектурного подхода Event Sourcing.

## 🌐 Демо

**Live Demo:** [https://your-username.github.io/canvas-event-sourcing/](https://your-username.github.io/canvas-event-sourcing/)

## 🏗️ Архитектура

Приложение состоит из двух частей:
- **Backend** - NestJS сервер с WebSocket и in-memory Event Store
- **Frontend** - Canvas приложение с TypeScript

### Event Sourcing

Приложение использует Event Sourcing архитектуру:
- Все изменения сохраняются как события
- Состояние вычисляется на основе событий
- Поддерживается история версий
- Создаются снимки каждые 10 событий для оптимизации

## 🚀 Быстрый старт

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/canvas-event-sourcing.git
cd canvas-event-sourcing
```

2. Установите зависимости:
```bash
npm run install:all
```

3. Запустите приложение:
```bash
npm run dev
```

4. Откройте браузер: http://localhost:5173

### Отдельный запуск

Backend:
```bash
cd backend
npm run start:dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 🎮 Использование

1. Кликните на canvas для создания квадрата
2. Перетащите квадрат мышкой для перемещения
3. Правый клик для удаления квадрата
4. Используйте панель истории версий для просмотра предыдущих состояний

## 🛠️ Функциональность

### Frontend
- Canvas для отрисовки графических объектов
- Drag & drop квадратов
- Панель истории версий
- WebSocket соединение с сервером
- Обработка ошибок
- Адаптивный дизайн

### Backend
- WebSocket Gateway для real-time коммуникации
- In-memory Event Store
- Снимки состояния каждые 10 событий
- Восстановление состояния по версии
- Типизированные события (SquareCreated, SquareMoved, SquareDeleted)

## 🧪 Тестирование

```bash
npm run test
```

## 📁 Структура проекта

```
├── backend/
│   ├── src/
│   │   ├── services/          # Бизнес-логика
│   │   ├── gateways/          # WebSocket обработчики
│   │   └── types/             # TypeScript типы
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # UI компоненты
│   │   ├── services/          # WebSocket сервис
│   │   ├── types/             # TypeScript типы
│   │   └── styles.css         # Стили
│   └── package.json
├── .github/workflows/         # GitHub Actions
└── package.json
```

## 🔌 API

### WebSocket события

#### От клиента к серверу:
- `getState` - получить состояние
- `getVersions` - получить список версий
- `createSquare` - создать квадрат
- `moveSquare` - переместить квадрат
- `deleteSquare` - удалить квадрат

#### От сервера к клиенту:
- `stateReceived` - состояние получено
- `versionsReceived` - версии получены
- `stateUpdated` - состояние обновлено
- `eventConfirmed` - событие подтверждено
- `error` - ошибка

## 📦 События

### SquareCreated
```typescript
{
  id: string;
  type: 'SquareCreated';
  timestamp: Date;
  aggregateId: string;
  version: number;
  data: {
    squareId: string;
    x: number;
    y: number;
    size: number;
    color: string;
  };
}
```

### SquareMoved
```typescript
{
  id: string;
  type: 'SquareMoved';
  timestamp: Date;
  aggregateId: string;
  version: number;
  data: {
    squareId: string;
    x: number;
    y: number;
  };
}
```

### SquareDeleted
```typescript
{
  id: string;
  type: 'SquareDeleted';
  timestamp: Date;
  aggregateId: string;
  version: number;
  data: {
    squareId: string;
  };
}
```

## 🚀 Деплой

Приложение автоматически деплоится на GitHub Pages при пуше в ветку `main`.

### Ручной деплой

1. Соберите frontend:
```bash
cd frontend
npm run build
```

2. Запустите GitHub Actions или используйте GitHub CLI:
```bash
gh workflow run deploy.yml
```

## 📝 Лицензия

MIT

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request 