# Cashboxes

Система для строительной компании — отслеживание касс недвижимостей (начальный/конечный остаток, приход, расход).

## Бизнес-домен

- **Object (Объект)** — недвижимость. Поле `url` — базовый префикс 1C-инстанса объекта
  (например `http://host/istiqlol/hs/api/`), без конкретного эндпоинта: `cashoborot` (список касс)
  и `cashdetails` (детализация) добавляются к нему на бэкенде автоматически (`OneCClient._child_url`).
- **Касса** — приходит из 1C по `url` объекта. Один объект может иметь несколько касс:
  ```json
  {"status": "success", "data": [{"id": "...", "name": "Касса USD", "ost1": 50, "sump": 0, "sumr": 0, "ost2": 50}]}
  ```
  - `ost1` — начальный остаток, `ost2` — конечный остаток, `sump` — приход, `sumr` — расход
- **UserObject** — контроль доступа: пользователь видит кассы только разрешённых объектов.

## Роли и доступ

- **Admin** — полный доступ: управление пользователями, объектами, назначение доступов.
- **User** — только раздел "Отчёты" (кассы по разрешённым объектам).

## Разделы (сайдбар)

| Раздел | Доступ |
|--------|--------|
| Пользователи | Только админы |
| └ Доступ к объектам | Список объектов с чекбоксами, grant/revoke по одному или bulk sync |
| Объекты | Только админы |
| Отчёты | Все пользователи |

## Стек

- **FastAPI** + **SQLAlchemy 2.0 async** + **PostgreSQL**
- **Alembic** — миграции
- **Redis** — (предусмотрен в конфиге)
- **PyJWT** — аутентификация (access + refresh токены)
- **Pydantic v2**
- **Ruff** — линтер/форматтер
- **import-linter** — DDD layer contracts

## Архитектура (DDD, слои)

```
src/
├── core/           # Чистые утилиты без зависимостей (errors, sorting, text, sentinels, config)
├── domain/         # Сущности, VO, исключения, нет зависимостей на внешние слои
├── application/    # Use cases, команды, запросы, DTO — зависит от domain + infrastructure
├── infrastructure/ # SQLAlchemy репозитории, UoW, маперы, JWT, HTTP клиент
└── api/            # FastAPI роутеры, schemas, dependencies, mappers
```

### Контракты import-linter
- `domain` — нулевые зависимости на внешние слои
- `core` — нет зависимостей на domain/application/infrastructure/api
- Слои: `api → application → infrastructure → domain`

## Ключевые паттерны

- **UnitOfWork** — `async with self.uow:` автокоммит/роллбек через `__aexit__`
- **Repository** — один на агрегат-рут; `UserObjectRepository` — прагматичное исключение для bulk-операций над join-таблицей
- **CQRS-style** — разделение `Command`/`Query` объектов в application слое
- **UNSET sentinel** — для partial update (`src/core/sentinels.py`)
- **Mapper классы** — `to_domain`, `to_model`, `to_dto` без бизнес-логики
- **Exception handlers** — маппинг доменных ошибок в HTTP через `ERROR_STATUS_MAP` + MRO

## API маршруты

### Auth
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`

### Users (только админы)
- `POST /v1/users`
- `GET /v1/users`
- `GET /v1/users/{user_id}`
- `PATCH /v1/users/{user_id}`
- `DELETE /v1/users/{user_id}`

### User Object (только админы)
- `GET /v1/users/{user_id}/objects` — все объекты с флагом `is_assigned`
- `PUT /v1/users/{user_id}/objects` — bulk sync (replace)
- `POST /v1/users/{user_id}/objects/{object_id}` — выдать доступ (идемпотентно)
- `DELETE /v1/users/{user_id}/objects/{object_id}` — убрать доступ (идемпотентно)

### Objects (только админы, включая чтение)
- `POST /v1/objects`
- `GET /v1/objects`
- `GET /v1/objects/{object_id}`
- `PATCH /v1/objects/{object_id}`
- `DELETE /v1/objects/{object_id}`

Обычные пользователи объекты напрямую не видят — только агрегированные кассы через Reports,
отфильтрованные по объектам, к которым у них есть доступ (`UserObject`).

### Reports (все пользователи)
- `GET /v1/reports/cashboxes?date_from=&date_to=` — кассы по объектам, доступным текущему
  пользователю (админ видит все активные объекты). Даты опциональны — 1C по умолчанию
  отдаёт данные за сегодня. Ответ сгруппирован по объекту (`items[].cashboxes[]`);
  объекты, недоступные из-за ошибки 1C, попадают в `failed_objects` — отчёт не падает
  целиком из-за одного недоступного объекта.
- `GET /v1/reports/cashboxes/{object_id}/{cash_id}?date_from=&date_to=` — детализация движений
  по одной кассе (`cashdetails` в 1C). Доступ — как и к самой кассе: админ видит любую,
  обычный пользователь — только по объектам с `UserObject`-доступом (`ForbiddenError` иначе).

## Роутер-архитектура

Правило: **один файл `endpoints.py` = один `APIRouter()` = один уровень доступа**,
объявленный на самом роутере (`dependencies=[Depends(require_...)]`), а не построчно на
каждом эндпоинте и не через `include_router(..., dependencies=...)`. Каждый `endpoints.py`
владеет полным URL-префиксом. `router.py` на любом уровне — чистый агрегатор: без prefix,
без `dependencies=[...]`.

Если внутри модуля есть эндпоинт с ДРУГИМ уровнем доступа — не добавляем второй роутер
или per-endpoint override в тот же файл, а выносим его в отдельный `endpoints.py`-файл
(или подпакет, если у него ещё и свои schemas/mappers/dependencies). Пример — `user/me.py`:
`/me` доступен любому аутентифицированному пользователю, а не только админам, поэтому это
отдельный файл рядом с `user/endpoints.py`, а не эндпоинт внутри него.

```
api/v1/router.py          prefix="/v1", агрегатор
├── auth/endpoints.py     prefix="/auth"                     deps=[]                    (публичный)
├── user/router.py        агрегатор
│   ├── me.py             prefix="/users"                    deps=[require_user]        → GET /me
│   │                     (включается первым — иначе /{user_id} перехватит /me)
│   ├── endpoints.py      prefix="/users"                    deps=[require_admin_role]  → CRUD пользователей
│   └── user_object/
│       └── endpoints.py  prefix="/users/{user_id}/objects"  deps=[require_admin_role]
└── object/endpoints.py   prefix="/objects"                  deps=[require_admin_role]  → чтение и запись
```

Если конкретному эндпоинту внутри роутера нужен сам объект пользователя (не только проверка
доступа) — например, `actor_id` для grant/revoke — он берёт его явным параметром
(`current_user: User = Depends(get_current_user)`), а не заново дублирует
`require_admin_role`; FastAPI кеширует зависимости в рамках запроса.

## Соглашения

- Форматирование: **табы**, строка до 120 символов (Ruff)
- Типы: PEP 585 (`list[X]`), PEP 604 (`X | Y`), PEP 695 не используется (TypeVar экспортируется между модулями)
- StrEnum вместо `class X(str, Enum)` (UP042)
- Комментарии только когда WHY неочевиден
- Bulk INSERT через `session.execute(insert(Model).on_conflict_do_nothing(), [dicts])` (PostgreSQL dialect)
- `SortColumns = dict[str, InstrumentedAttribute[Any] | ColumnElement[Any]]` — для сортировки в репозиториях
