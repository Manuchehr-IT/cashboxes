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

Backend поднимется на `http://localhost:8000`. Миграции **не** применяются автоматически при
старте контейнера — после первого поднятия (и после каждого деплоя с новыми миграциями) нужно
накатить их вручную:

```bash
docker compose exec backend alembic upgrade head
```

> `docker-compose.override.yml` в `.gitignore` и на сервер не попадает — деплой через git
> (`clone`/`pull`) всегда поднимает именно продовую конфигурацию из `docker-compose.yml`.
> Если разворачиваете иначе (например, `rsync` с локальной машины), проверьте, что override-файл
> в переносимый набор не попадает — иначе Traefik-роутинг для сервисов окажется выключен, а
> backend/frontend запустятся в dev-режиме.

## Traefik

- **prod** (`docker-compose.yml`) — рассчитан на **внешний**, общий Traefik: отдельный, уже
  готовый инстанс из [traefik-infra](https://github.com/Manuchehr-IT/traefik-infra), поднятый на
  сервере отдельно (своим `docker compose up`, сеть `web`). Сам cashboxes его не поднимает и не
  настраивает — только объявляет лейблы на `backend`/`frontend` и подключается к сети `web`
  (`external: true`). HTTPS через Let's Encrypt (DNS-01 challenge), нужен настоящий домен в `DOMAIN`.
- **LAN** (`docker-compose.lan.yml`) — свой Traefik прямо в этом compose-файле, без TLS: сервер тут
  обычно доступен только по голому IP в локальной сети, а Let's Encrypt не выпускает сертификаты
  на IP — поэтому просто HTTP. `DOMAIN` в этом случае — IP сервера, а не домен.

## Проксирование фронт → бэкенд

Бэкенд нужен только фронту: отдельного публичного домена/порта у него нет ни в одном из
compose-файлов, наружу торчит только frontend. Браузер всегда обращается к одному ориджину —
`/v1/*` и `/storage/*` (то, что реально дёргает `frontend/src/api/client.ts`) уходят туда же и
долетают до backend'а без CORS и без второго домена:

- **prod** и **LAN** — маршрутизацию делает сам **Traefik**, без nginx: у backend'а лейблом
  объявлен роутер на тот же `Host`, что и у frontend'а, но только для `PathPrefix(/v1, /storage)`
  и с более высоким приоритетом — он и перехватывает эти пути раньше catch-all роутера frontend'а.
  Собранный фронт при этом — обычная статика (`serve`, `frontend/Dockerfile.production`), сама
  ничего не проксирует.
- **dev** (`docker-compose.override.yml`, `vite dev`) — то же самое делает `server.proxy` в
  `frontend/vite.config.ts`, с целью `http://backend:8000` (имя сервиса в docker-сети).

Поэтому в прод/LAN-сборку `VITE_API_URL` больше не передаётся — baseURL axios всегда
относительный `/v1` (см. `api/client.ts`), доходит до backend'а через Traefik на своём же
ориджине. `VITE_API_URL` остался только для dev (см. «Локальная разработка без Docker» ниже).

## Деплой в локальной сети

Если сервер стоит в локальной сети компании, без домена и внешнего доступа, — используйте
`docker-compose.lan.yml` вместо `docker-compose.yml`. Это отдельный самостоятельный compose-файл
(не оверлей — Docker Compose не умеет вычитать лейблы оверлеем, только добавлять): свой Traefik,
без домена, без сети `web` (см. «Traefik» выше).

```bash
docker compose -f docker-compose.lan.yml up -d --build
docker compose -f docker-compose.lan.yml exec backend alembic upgrade head
```

В `.env` для этого сценария важно:

- `DOMAIN` — не домен, а IP(-а) сервера в локальной сети, подставляется в `Host(...)` как есть
  (см. `.env.example`), **без порта** — Traefik сравнивает `Host()` с заголовком `Host` уже без
  порта (он всегда отбрасывается перед сравнением), так что порт туда добавлять не нужно и он
  просто не будет матчиться. Если сервер виден по нескольким адресам (например, внутренний IP в
  локальной сети и внешний через проброс портов) — перечислите оба через запятую:
  `DOMAIN=\`10.250.10.135\`, \`185.105.230.224\``.
- `FRONTEND_PORT` — опционально, порт Traefik на хосте (по умолчанию `80`); задать, если 80 уже
  занят на этой машине чем-то другим.

## Переменные окружения

`.env` (корень репозитория, используется docker-compose):

| Переменная | Назначение |
|---|---|
| `APP__ENVIRONMENT` | `local` / `production` |
| `APP__ALLOWED_ORIGINS`, `APP__ALLOWED_HOSTS` | CORS/хосты |
| `APP__TITLE`, `APP__LANGUAGES`, `APP__DEFAULT_LANGUAGE` | метаданные приложения |
| `DATABASE__NAME`, `DATABASE__USER`, `DATABASE__PASSWORD`, `DATABASE__HOST`, `DATABASE__PORT` | PostgreSQL |
| `REDIS__HOST`, `REDIS__PORT` | Redis |
| `DOMAIN` | Traefik-`Host(...)`: реальный домен в проде, IP сервера на LAN |
| `FRONTEND_PORT` | порт своего Traefik на хосте в LAN-сценарии (по умолчанию `80`) |

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

По умолчанию Vite dev-сервер проксирует `/v1` и `/storage` на `http://localhost:8000`
(backend из примера выше, запущенный тем же способом на хосте). Если backend слушает
другой адрес, переопределите целью прокси через `VITE_API_URL` — например,
в `frontend/.env.local` (см. `frontend/vite.config.ts`).

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
