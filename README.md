# Cashboxes

Система для строительной компании — отслеживание касс недвижимостей (начальный/конечный
остаток, приход, расход). Данные по кассам приходят из 1C по объектам; доступ пользователей
к отчётам ограничивается назначенными объектами.

Подробное описание бизнес-домена, архитектуры и API — в [CLAUDE.md](CLAUDE.md).

## Стек

- **Backend**: FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, Alembic, Redis, PyJWT, Pydantic v2
- **Frontend**: React, TypeScript, Vite, TanStack Query/Table, React Router, shadcn/ui, Tailwind

## Быстрый старт (Docker)

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# заполнить переменные (см. ниже)

docker compose up -d --build
```

Backend поднимется на `http://localhost:8000`, миграции применяются автоматически при старте
контейнера.

## Переменные окружения

`.env` (корень репозитория, используется docker-compose и фронтендом):

| Переменная | Назначение |
|---|---|
| `APP__ENVIRONMENT` | `local` / `production` |
| `APP__ALLOWED_ORIGINS`, `APP__ALLOWED_HOSTS` | CORS/хосты |
| `APP__TITLE`, `APP__LANGUAGES`, `APP__DEFAULT_LANGUAGE` | метаданные приложения |
| `DATABASE__NAME`, `DATABASE__USER`, `DATABASE__PASSWORD`, `DATABASE__HOST`, `DATABASE__PORT` | PostgreSQL |
| `REDIS__HOST`, `REDIS__PORT` | Redis |
| `VITE_API_URL` | адрес backend API для фронтенда |

`backend/.env` (только backend-контейнер):

| Переменная | Назначение |
|---|---|
| `REDIS__DB` | номер БД Redis |
| `JWT__SECRET_KEY`, `JWT__ALGORITHM` | подпись токенов |
| `JWT__ACCESS_TOKEN_EXPIRE_MINUTES`, `JWT__REFRESH_TOKEN_EXPIRE_DAYS` | время жизни токенов |
| `STORAGE__DIR` | директория для файлового хранилища |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | учётка первого админа (см. ниже) |
| `ONEC__USERNAME`, `ONEC__PASSWORD` | Basic Auth для запросов к 1C |

## Первый администратор

Пользователей нельзя создать через публичный API — первого админа создаёт отдельный скрипт
(не миграция), читающий креды из `ADMIN_USERNAME`/`ADMIN_PASSWORD`:

```bash
cd backend
python scripts/create_admin.py
```

## Локальная разработка без Docker

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
uvicorn src.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Проверки

```bash
# backend
cd backend
ruff check .
lint-imports   # контракты DDD-слоёв (import-linter)

# frontend
cd frontend
npm run lint
npm run build  # tsc -b + vite build
```
