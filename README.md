# Canvas Event Sourcing Application

Full-stack приложение с Event Sourcing и историей версий, демонстрирующее работу архитектурного подхода Event Sourcing.

## Архитектура

Приложение состоит из двух частей:
- **Backend** - NestJS сервер с WebSocket и PostgreSQL
- **Frontend** - Canvas приложение с TypeScript

### Event Sourcing

Приложение использует Event Sourcing архитектуру:
- Все изменения сохраняются как события
- Состояние вычисляется на основе событий
- Поддерживается история версий
- Создаются снимки каждые 10 событий для оптимизации

## Требования

- Node.js 18+
- PostgreSQL 12+ (или Docker)
- npm или yarn

## Быстрый старт с Docker

1. Запустите PostgreSQL:
```bash
docker-compose up -d postgres
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

## Ручная установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd canvas-event-sourcing
```

2. Установите зависимости:
```bash
npm run install:all
```

3. Настройте базу данных PostgreSQL:
```sql
CREATE DATABASE canvas_events;
```

4. Настройте переменные окружения (создайте `.env` файл в корне проекта):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=canvas_events
```

## Запуск

### Разработка

Запустите оба сервера одновременно:
```bash
npm run dev
```

Или запустите отдельно:

Backend:
```bash
npm run dev:backend
```

Frontend:
```bash
npm run dev:frontend
```

### Продакшн

Соберите приложение:
```bash
npm run build
```

Запустите backend:
```bash
cd backend
npm run start:prod
```

## Использование

1. Откройте браузер и перейдите на `http://localhost:5173`
2. Кликните на canvas для создания квадрата
3. Перетащите квадрат мышкой для перемещения
4. Правый клик для удаления квадрата
5. Используйте панель истории версий для просмотра предыдущих состояний

## Функциональность

### Frontend
- Canvas для отрисовки графических объектов
- Drag & drop квадратов
- Панель истории версий
- WebSocket соединение с сервером
- Обработка ошибок
- Адаптивный дизайн

### Backend
- WebSocket Gateway для real-time коммуникации
- Event Store с PostgreSQL
- Снимки состояния каждые 10 событий
- Восстановление состояния по версии
- Типизированные события (SquareCreated, SquareMoved, SquareDeleted)
- Обработка ошибок и валидация

## Тестирование

Запустите тесты:
```bash
npm run test
```

Тесты покрывают:
- Event Store сервис
- Применение событий
- Создание снимков
- Получение состояния по версии

## Структура проекта

```
├── backend/
│   ├── src/
│   │   ├── entities/          # TypeORM сущности
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
├── docker-compose.yml         # Docker конфигурация
└── package.json
```

## API

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

## События

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

## Особенности реализации

### Event Sourcing
- Все изменения сохраняются как неизменяемые события
- Состояние восстанавливается путем применения событий
- Поддержка снимков для оптимизации производительности
- Возможность путешествия во времени по версиям

### Производительность
- Снимки создаются каждые 10 событий
- Оптимизированные запросы к базе данных
- Индексы на ключевых полях

### Безопасность
- Валидация всех входящих данных
- Обработка ошибок на всех уровнях
- Типизация TypeScript

## Устранение неполадок

### Проблемы с подключением к базе данных
1. Убедитесь, что PostgreSQL запущен
2. Проверьте настройки подключения в `.env`
3. Убедитесь, что база данных `canvas_events` существует

### Проблемы с WebSocket
1. Проверьте, что backend запущен на порту 3000
2. Убедитесь, что CORS настроен правильно
3. Проверьте консоль браузера на ошибки

### Проблемы с frontend
1. Убедитесь, что все зависимости установлены
2. Проверьте, что Vite запущен на порту 5173
3. Очистите кэш браузера

## Лицензия

MIT 