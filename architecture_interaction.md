# Модель взаимодействия — Geek Flea Market

## 1. Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│              ВНЕШНЯЯ СЕТЬ (Интернет / Браузеры)                 │
│                                                                 │
│   Браузер (пользователь)        Браузер (модератор)             │
│           │                              │                      │
│           │ :5174                        │ :4000                │
└───────────┼──────────────────────────────┼──────────────────────┘
            │                              │ 
            ▼                              ▼
┌──────────────────────────────────────────────────────────────────┐
│              DOCKER-ИНФРАСТРУКТУРА (все в контейнерах)           │
│                                                                  │
│    frontend-public                  ssr-admin                    │
│     (Vue 3 SPA)               (Express.js + Pug)                 │
│         :5174                          :4000                     │
│           │                              │                       │
│           └────────────────┬─────────────┘                       │
│                            │ :3010 (Gateway)                     │
│                            ▼                                     │
│                  ┌─────────────────────────┐                     │
│                  │     gateway-service     │                     │
│                  │         :3010           │                     │
│                  │  • verifyJWT            │                     │
│                  │  • requireModerator     │                     │
│                  │  • proxy routing        │                     │
│                  │  • /api/docs (Swagger)  │                     │
│                  └──┬────┬────┬────┬────┬──┘                     │
│                     │    │    │    │    │                        │
│            ┌────────┘    │    │    │    └──────────┐             │
│            ▼             ▼    ▼    ▼               ▼             │
│       auth-service   catalog billing  export   dashboard         │
│          :3001        :3002   :3003   :3004      :3005           │
│            │            │              │            │            │
│            │            │  /internal/  │            │            │
│            └────────────┴──────────────┴────────────┘            │
│                    межсервисные вызовы                           │
│                                                                  │
│                        public-api                                │
│                          :3006                                   │
│                    (своя схема БД)                               │
│                                                                  │
│                        postgres                                  │
│                          :5432                                   │
│                    (все схемы БД)                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Сервисы — роли и ответственность

### 2.1 gateway-service (:3010)

Единственная публичная точка входа для всех HTTP-запросов к бэкенду.

**Что делает:**
- Принимает все входящие запросы от `frontend-public` и `ssr-admin` через порт `:3010`
- Верифицирует JWT из заголовка `Authorization: Bearer` (кроме публичных маршрутов)
- Проверяет роль `moderator` для модераторских маршрутов (`/api/auth/*`, `/api/adverts/*`, `/api/categories/*`, `/api/billing/*`, `/api/dashboard`, `/api/export/*`)
- Добавляет заголовки `X-User-Id` и `X-User-Role` в проксируемый запрос
- Проксирует запрос нужному сервису через `http-proxy-middleware`
- Отдаёт агрегированный Swagger UI на `/api/docs`

**Что НЕ делает:**
- Не хранит данные
- Не содержит бизнес-логики
- Не верифицирует JWT повторно — это делается один раз здесь

**Публичные маршруты (без JWT):**
```
POST /api/auth/login
POST /api/public/auth/register
POST /api/public/auth/login
GET  /api/docs
GET  /api/docs/:service/spec.json
```

---

### 2.2 auth-service (:3001)

**Владеет:** схема `auth`, таблица `users` (модераторская часть)

**Что делает:**
- Авторизация модераторов (login → JWT)
- Хранит пользователей модераторской части
- Отдаёт список пользователей для страницы Users в админке
- Отдаёт данные конкретного пользователя по ID

**Внешние маршруты** (через Gateway, с JWT):
```
POST /api/auth/login         — вход, возвращает JWT
GET  /api/auth/me            — профиль текущего пользователя
GET  /api/auth/users         — список пользователей
GET  /api/auth/users/search  — поиск по id/phone/email
GET  /api/auth/users/count   — количество пользователей
GET  /api/auth/users/:id     — один пользователь
```

**Внутренние маршруты** (только внутри Docker, без JWT):
```
GET /internal/users/count   — для dashboard-service
GET /internal/users/:id     — для export-service
```

---

### 2.3 catalog-service (:3002)

**Владеет:** схема `catalog`, таблицы `categories`, `adverts`, `advert_photos`

**Что делает:**
- CRUD категорий
- CRUD объявлений для модераторов
- Смена статуса объявлений (логика переходов)
- Хранит `authorId: number` вместо relation к User

**Внешние маршруты** (через Gateway, с JWT, роль moderator):
```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
GET    /api/adverts
GET    /api/adverts/:id
PATCH  /api/adverts/:id/status
```

**Внутренние маршруты** (только внутри Docker, без JWT):
```
GET /internal/adverts         — для export-service
GET /internal/adverts/stats   — для dashboard-service
GET /internal/adverts/top     — для dashboard-service
```

---

### 2.4 billing-service (:3003)

**Владеет:** схема `billing`, таблица `paid_services`

**Что делает:**
- Хранит платные услуги объявлений (модераторская часть)
- Позволяет включать/отключать услуги
- Хранит `advertId: number` без FK constraint

**Внешние маршруты** (через Gateway, с JWT, роль moderator):
```
GET   /api/billing/adverts/:advertId/services
PATCH /api/billing/adverts/:advertId/services/:serviceId
```

---

### 2.5 export-service (:3004)

**Не владеет БД.** Агрегатор.

**Что делает:**
- Получает список объявлений из `catalog-service` через `/internal/adverts`
- Получает данные авторов из `auth-service` через `/internal/users/:id`
- Склеивает данные и формирует CSV (UTF-8 + BOM)
- Стримит файл напрямую в ответ без буферизации

**Внешние маршруты** (через Gateway, с JWT, роль moderator):
```
GET /api/export/adverts?status=...&categoryId=...&search=...
```

---

### 2.6 dashboard-service (:3005)

**Не владеет БД.** Агрегатор.

**Что делает:**
- Параллельно запрашивает данные из нескольких сервисов
- Собирает сводную статистику для главной страницы админки

**Внутренние запросы при каждом вызове:**
```
GET http://auth-service:3001/internal/users/count
GET http://catalog-service:3002/internal/adverts/stats
GET http://catalog-service:3002/internal/adverts/top
```

**Внешние маршруты** (через Gateway, с JWT, роль moderator):
```
GET /api/dashboard
```

---

### 2.7 public-api (:3006)

**Владеет:** схема `public_api` — полностью независимая от остальных сервисов.

Таблицы: `users`, `categories`, `adverts`, `advert_photos`, `advert_views`, `advantage_services`

**Что делает:**
- Регистрация и авторизация пользователей (своя база)
- Публичный просмотр объявлений без JWT
- Создание и управление объявлениями для авторов
- Логика VIP/TOP в результатах поиска
- Фиксация просмотров авторизованных пользователей
- Управление Advantage-услугами (активация, продление)

**Публичные маршруты** (через Gateway, без JWT):
```
POST GET  /api/public/auth/register
POST      /api/public/auth/login
GET       /api/public/categories
GET       /api/public/adverts
GET       /api/public/adverts/:id
GET       /api/public/adverts/:id/services
```

**Защищённые маршруты** (через Gateway, с JWT, любая роль):
```
GET   PATCH /api/public/auth/profile
GET         /api/public/auth/my-adverts
POST        /api/public/adverts
PATCH       /api/public/adverts/:id
PATCH       /api/public/adverts/:id/status
DELETE      /api/public/adverts/:id
POST        /api/public/adverts/:id/services
POST        /api/public/adverts/:id/services/:serviceId/extend
```

---

### 2.8 ssr-admin (:4000)

**Не владеет БД.** Серверный рендеринг поверх Gateway.

**Что делает:**
- Рендерит HTML на сервере через Pug-шаблоны
- Хранит JWT в серверной сессии (`express-session` + PostgreSQL) — браузер никогда не видит токен
- При каждом запросе страницы делает HTTP-запрос к Gateway с JWT из сессии
- Отдаёт готовый HTML браузеру
- Все изменения — через HTML-формы с PRG-паттерном (Post → Redirect → Get)

**Страницы:**
```
GET  /login          — форма входа
POST /login          — обработка входа → сохранить JWT в сессии → redirect /
POST /logout         — destroy сессии → redirect /login
GET  /               — дашборд (данные из /api/dashboard)
GET  /categories     — список категорий
POST /categories     — создать
POST /categories/:id/edit    — обновить
POST /categories/:id/delete  — удалить
GET  /users          — список пользователей
GET  /adverts        — список с фильтрами + кнопка экспорта
GET  /adverts/export — стрим CSV
GET  /adverts/:id    — детальная
POST /adverts/:id/status           — сменить статус
POST /adverts/:id/services/:svcId  — вкл/откл услугу
```

---

### 2.9 frontend-public (:5174)

Vue 3 SPA для пользователей платформы.

**Что делает:**
- Отображает публичный каталог объявлений с фильтрами
- Регистрация и авторизация пользователей
- Управление профилем
- Создание и редактирование объявлений
- Управление статусом и Advantage-услугами для своих объявлений
- Хранит JWT в `localStorage`
- Единый axios-клиент → Gateway `:3010`

---

### 2.10 postgres (:5432)

Единый инстанс PostgreSQL. Все сервисы используют разные **схемы**:

| Схема | Владелец |
|---|---|
| `auth` | auth-service |
| `catalog` | catalog-service |
| `billing` | billing-service |
| `public_api` | public-api |
| `public` (таблица `sessions`) | ssr-admin (connect-pg-simple) |

Сервисы не ходят в чужие схемы напрямую — только через HTTP.

---

## 3. Детальные потоки запросов

### 3.1 Пользователь просматривает список объявлений (без авторизации)

```
1. Браузер → GET http://localhost:5174/
2. frontend-public отдаёт index.html (SPA)
3. Vue Router рендерит HomeView
4. HomeView монтируется, вызывает:
   a. GET http://localhost:3010/api/public/categories
   b. GET http://localhost:3010/api/public/adverts?sortBy=date&sortOrder=desc
5. Gateway получает запросы:
   a. Маршрут /api/public/* — публичный, JWT не требуется
   b. Проксирует оба запроса в public-api:3006
6. public-api обрабатывает /api/public/adverts:
   a. Находит TOP-объявления (expiresAt > NOW(), тип 'top') — применяет все фильтры
   b. Находит VIP-объявления (expiresAt > NOW(), тип 'vip') — особые правила фильтрации
   c. Остальные published объявления — стандартная сортировка
   d. Собирает результат: [TOP...] + [VIP...] + [основной список]
7. Gateway возвращает ответы фронту
8. HomeView рендерит карточки с бейджами VIP/TOP
```

---

### 3.2 Пользователь авторизуется и просматривает объявление

```
1. Браузер → POST http://localhost:3010/api/public/auth/login
   { login: "ethan@ws-s17.kz", password: "ethan_123" }
2. Gateway: маршрут в списке публичных — пропускает без JWT
3. public-api: проверяет пароль через bcrypt, возвращает JWT
4. frontend-public: сохраняет токен в localStorage и Pinia store

5. Браузер → GET http://localhost:3010/api/public/adverts/42
   Authorization: Bearer <JWT>
6. Gateway: verifyJWT ✓ (роль user — requireModerator не применяется для /api/public/*)
7. public-api:
   a. authenticate middleware — читает JWT, пишет req.user
   b. Находит объявление по ID
   c. Создаёт/обновляет запись в advert_views (advertId=42, userId=<из токена>)
   d. Возвращает детали объявления с viewsCount
8. frontend-public: рендерит AdvertDetailView
   a. Если advert.author.id === authStore.user.id — показывает кнопки управления
   b. Телефон автора показывается (пользователь авторизован)
```

---

### 3.3 Пользователь создаёт объявление и отправляет на модерацию

```
1. POST http://localhost:3010/api/public/adverts
   Authorization: Bearer <JWT>
   { title, body, price, categoryId, photos: [{url, order}] }
2. Gateway: verifyJWT ✓ → проксирует
3. public-api: создаёт объявление со статусом 'draft'
4. frontend-public: редирект на /adverts/:id

5. PATCH http://localhost:3010/api/public/adverts/55/status
   { status: "moderation" }
6. Gateway: verifyJWT ✓ → проксирует
7. public-api:
   a. Проверяет что req.user.id === advert.authorId
   b. Проверяет переход: draft → moderation ✓
   c. Обновляет статус
8. frontend-public: обновляет страницу, показывает статус "На модерации"
   — кнопка "Отправить на модерацию" исчезает
```

---

### 3.4 Модератор входит через SSR-панель и публикует объявление

```
1. Браузер → GET http://localhost:4000/login
2. ssr-admin: рендерит форму входа (Pug → HTML)
3. Браузер показывает готовый HTML (не SPA, сразу видно содержимое)

4. Браузер → POST http://localhost:4000/login
   { login: "olivia@ws-s17.kz", password: "olivia_123" }
5. ssr-admin:
   a. POST http://localhost:3010/api/auth/login → получает JWT
   b. req.session.token = JWT   ← JWT остаётся на сервере
   c. req.session.user = { id, name, role }
   d. redirect 302 → /

6. Браузер → GET http://localhost:4000/
7. ssr-admin:
   a. requireAuth: req.session.token ✓
   b. createGatewayClient(req.session.token)
   c. GET http://localhost:3010/api/dashboard (с JWT в заголовке)
   d. Gateway: verifyJWT ✓, requireModerator ✓ → dashboard-service
   e. dashboard-service:
      — GET http://auth-service:3001/internal/users/count
      — GET http://catalog-service:3002/internal/adverts/stats
      — GET http://catalog-service:3002/internal/adverts/top
      — собирает ответ
   f. ssr-admin рендерит dashboard.pug с данными → готовый HTML
8. Браузер получает HTML с цифрами статистики

9. Браузер → GET http://localhost:4000/adverts/55
10. ssr-admin:
    a. GET http://localhost:3010/api/adverts/55 (с JWT)
    b. GET http://localhost:3010/api/billing/adverts/55/services (с JWT)
    c. Оба запроса параллельно
    d. Рендерит advert-detail.pug: данные объявления + блок услуг
    e. Статус 'moderation' → показывает кнопки "Опубликовать" и "Отклонить"

11. Браузер → POST http://localhost:4000/adverts/55/status
    { status: "published" }
12. ssr-admin:
    a. PATCH http://localhost:3010/api/adverts/55/status { status: "published" }
    b. Gateway: verifyJWT ✓, requireModerator ✓ → catalog-service
    c. catalog-service: переход moderation → published ✓, publishedAt = NOW()
    d. ssr-admin получает 200
    e. redirect 302 → /adverts/55   ← PRG-паттерн
13. Браузер → GET http://localhost:4000/adverts/55
    — страница перезагружается, статус теперь "Опубликовано"
```

---

### 3.5 Модератор экспортирует CSV

```
1. Браузер → GET http://localhost:4000/adverts?status=published
2. ssr-admin рендерит страницу со списком и кнопкой "Экспорт CSV"
   — кнопка это ссылка: /adverts/export?status=published

3. Браузер → GET http://localhost:4000/adverts/export?status=published
4. ssr-admin:
   a. GET http://localhost:3010/api/adverts/export?status=published (с JWT)
   b. axios responseType: 'stream'
   c. Пайпит поток напрямую в res, не буферизует

5. Gateway → export-service:3004/api/export/adverts?status=published
6. export-service:
   a. GET http://catalog-service:3002/internal/adverts?status=published
   b. Собирает уникальные authorId из результата
   c. GET http://auth-service:3001/internal/users/:id  (для каждого автора)
   d. Склеивает данные
   e. Формирует CSV строки: UTF-8 BOM + заголовок + данные
   f. Стримит ответ

7. Поток проходит: export-service → Gateway → ssr-admin → браузер
8. Браузер скачивает файл export_adverts.csv
```

---

### 3.6 Пользователь активирует VIP для своего объявления

```
1. Объявление должно быть в статусе 'published'
2. AdvertDetailView показывает кнопку "Активировать VIP" (только автору)

3. POST http://localhost:3010/api/public/adverts/42/services
   Authorization: Bearer <JWT>
   { type: "vip" }
4. Gateway: verifyJWT ✓ → проксирует в public-api
5. public-api:
   a. requireAuth: req.user ✓
   b. Находит объявление: advert.authorId === req.user.id ✓
   c. Проверяет статус: published ✓
   d. Ищет активную VIP-услугу для этого объявления
      — Если нет: создаёт новую, expiresAt = NOW() + 7 дней
      — Если есть: expiresAt += 7 дней (продление)
   e. Возвращает 201 с данными услуги
6. frontend-public: обновляет блок услуг на странице

7. Теперь при GET /api/public/adverts?search=...
   — объявление попадёт в VIP-блок (позиции 2-4)
   — даже если не соответствует текстовому поиску
   — даже если цена выходит за priceMax менее чем на 100
```

---

### 3.7 Swagger — разработчик изучает API

```
1. Браузер → GET http://localhost:3010/api/docs
2. Gateway: маршрут публичный (без JWT)
3. docsRouter: отдаёт Swagger UI HTML
   — swaggerOptions.urls содержит 6 сервисов в selector'е

4. Разработчик выбирает "Public API" в selector'е
5. UI → GET http://localhost:3010/api/docs/public/spec.json
6. Gateway → GET http://public-api:3006/docs/spec.json
7. public-api отдаёт сгенерированный swagger-jsdoc JSON
8. UI отображает все эндпоинты Public API

9. Разработчик нажимает "Authorize", вставляет JWT
10. Тестирует POST /api/public/adverts прямо в браузере
    — запрос идёт через Gateway с токеном
```

---

## 4. Таблица роутинга Gateway (полная)

| Метод | Входящий путь | Проксируется в | JWT | Роль |
|---|---|---|---|---|
| POST | `/api/auth/login` | auth-service:3001 | ❌ | — |
| GET | `/api/auth/me` | auth-service:3001 | ✅ | moderator |
| GET | `/api/auth/users*` | auth-service:3001 | ✅ | moderator |
| GET | `/api/dashboard` | dashboard-service:3005 | ✅ | moderator |
| GET/POST/PUT/DELETE | `/api/categories*` | catalog-service:3002 | ✅ | moderator |
| GET | `/api/adverts/export` | export-service:3004 | ✅ | moderator |
| GET/PATCH | `/api/adverts*` | catalog-service:3002 | ✅ | moderator |
| GET/PATCH | `/api/billing*` | billing-service:3003 | ✅ | moderator |
| POST | `/api/public/auth/register` | public-api:3006 | ❌ | — |
| POST | `/api/public/auth/login` | public-api:3006 | ❌ | — |
| * | `/api/public*` | public-api:3006 | ✅ | любая |
| GET | `/api/docs` | docsRouter (local) | ❌ | — |
| GET | `/api/docs/:service/spec.json` | docsRouter (local) | ❌ | — |

> Порядок регистрации важен: `/api/adverts/export` должен быть выше `/api/adverts*`

---

## 5. Схемы базы данных

```
postgres:5432 / database: geekflea
│
├── schema: auth
│   └── users                    ← модераторская часть
│
├── schema: catalog
│   ├── categories
│   ├── adverts                  ← хранит authorId (без FK)
│   └── advert_photos
│
├── schema: billing
│   └── paid_services            ← хранит advertId (без FK)
│
├── schema: public_api           ← полностью независимо
│   ├── users
│   ├── categories
│   ├── adverts
│   ├── advert_photos
│   ├── advert_views
│   └── advantage_services
│
└── schema: public
    └── sessions                 ← express-session для ssr-admin
```

---

## 6. Публичные порты — итог

| Порт | Сервис | Для кого |
|---|---|---|
| **3010** | gateway-service | Все HTTP-клиенты |
| **4000** | ssr-admin | Модератор (браузер) |
| **5174** | frontend-public | Пользователь (браузер) |
| **5432** | postgres | Только локальная отладка |

Все остальные порты (3001–3006) доступны **только внутри Docker-сети**.
