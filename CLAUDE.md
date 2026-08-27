# Cashboxes

Система для строительной компании — отслеживание касс недвижимостей (начальный/конечный остаток, приход, расход).

## Бизнес-домен

- **Object (Объект)** — недвижимость. Поле `url` — базовый префикс 1C-инстанса объекта
  (например `http://host/istiqlol/hs/api/`), без конкретного эндпоинта: `cashoborot` (список касс)
  и `cashdetails` (детализация) добавляются к нему на бэкенде автоматически (`OneCClient._child_url`).
- **Касса** — приходит из 1C по `url` объекта. Один объект может иметь несколько касс:
  ```json
  {"status": "success", "data": [{"id": "...", "name": "Касса USD", "currency": "USD", "main": true, "type": "Наличные", "ost1": 50, "sump": 0, "sumr": 0, "ost2": 50}]}
  ```
  - `ost1` — начальный остаток, `ost2` — конечный остаток, `sump` — приход, `sumr` — расход
  - `main` — является ли касса основной (используется для `cash_access_scope`, см. ниже)
  - `type` — тип операции кассы (Наличные, Алиф банк, Дс банк и др.), независим от `currency`
  - `cashdetails` тоже отдаёт `main` в каждой строке `data[]` (используется для проверки доступа
    в `GetCashDetails` — см. Reports)
- **UserObject** — контроль доступа: пользователь видит кассы только разрешённых объектов.
- **User.cash_access_scope** — какие кассы видит пользователь по флагу `main`: `main` (только
  основные), `non_main` (только неосновные) или `all` (все, по умолчанию). Глобально на
  пользователе, не по объектам. У админов не проверяется — они всегда видят все кассы
  (`User.effective_cash_access_scope`).
- **Контрагенты (задолженности)** — приходят из 1C по `url` объекта, эндпоинт `debts`
  (`OneCClient.fetch_debts`, `.../hs/api/debts`):
  ```json
  {"status": "success", "data": [{"acc_code": "2.20.10", "acc_name": "Счета к оплате за товары и услуги", "kontr": "Поставщики дом", "manager": "user1", "contract": "Основной договор", "debt": -200, "currency": "USD", "vid_raschet": ""}]}
  ```
  Доступ такой же, как у касс (по `UserObject`), без отдельного scope-поля. `acc_name` — счёт/
  аккаунт, `kontr` — контрагент, `debt` — сумма задолженности (может быть отрицательной).
- **User.can_view_cashboxes / can_view_counterparties** — включают ли разделы «Кассы»/«Контрагенты»
  вообще, независимо от `UserObject`-доступа к конкретным объектам. Глобально на пользователе,
  по умолчанию `true` для новых пользователей — админ может отключить ненужный раздел на вкладке
  «Настройки» страницы пользователя. У админов не проверяется — всегда `true`, отключить нельзя
  (`User.effective_can_view_cashboxes`/`effective_can_view_counterparties`). Сервер проверяет это
  в начале `ListCashboxes`/`ListCounterparties` (`CashboxesAccessForbiddenError`/
  `CounterpartiesAccessForbiddenError`, иначе `UserObject`-доступ к объектам не спасёт от прямого
  запроса к разделу); фронт дополнительно скрывает пункт в сайдбаре, если разрешения нет.

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
- `PATCH /v1/users/{user_id}/password` — сменить пароль пользователя. Админ не может сменить пароль
  другого админа (может — свой собственный); `ForbiddenError` иначе.

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
  целиком из-за одного недоступного объекта. Кассы дополнительно фильтруются по
  `User.effective_cash_access_scope` (`ListCashboxes._is_visible`) — не подходящие под
  main/non_main просто не попадают в `cashboxes[]`.
- `GET /v1/reports/cashboxes/{object_id}/{cash_id}?date_from=&date_to=` — детализация движений
  по одной кассе (`cashdetails` в 1C). Доступ — как и к самой кассе: админ видит любую,
  обычный пользователь — только по объектам с `UserObject`-доступом (`ForbiddenError` иначе).
  Дополнительно перепроверяется `cash_access_scope` по полю `main` из ответа `cashdetails`
  (`CashAccessForbiddenError` иначе) — иначе кассу вне разрешённого scope можно было бы открыть
  напрямую по ссылке, даже не видя её в списке. Пустой ответ (нет движений за период) не
  блокируется — раскрывать нечего.
- `GET /v1/reports/counterparties` — задолженности контрагентов по объектам, доступным текущему
  пользователю (тот же принцип доступа, что и у касс: админ — все активные объекты, обычный
  пользователь — только по `UserObject`). Данные приходят из 1C (`debts`) без дат — 1C сам решает,
  за какой период отдавать. Ответ сгруппирован по объекту (`items[].debts[]`); `failed_objects` —
  как у касс. Фильтры по `acc_name` (обязательный на фронте — без выбора счёта данные не
  показываются) и `manager` (опциональный) — целиком на фронте, бэкенд отдаёт список без
  серверной фильтрации (1C не поддерживает параметры для `debts`).

### Logs (только админы)
- `GET /v1/logs?limit=&level=&q=` — хвост файла `logs/app.log` (без ротированных `.1`/`.2`/...).
  `limit` — сколько последних (после фильтров) строк вернуть (по умолчанию 200, максимум 5000),
  `level` — `DEBUG`/`INFO`/`WARNING`/`ERROR`/`CRITICAL`, `q` — подстрока (регистронезависимо).
  Ответ: `{lines: string[], total: number}`, где `total` — количество строк, подошедших под
  фильтры, до обрезки по `limit`.

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
