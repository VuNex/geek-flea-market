# Geek Flea Market (Барахолка для гиков)

Микросервисная платформа для обмена и продажи гаджетов и гик-атрибутики. Проект построен на современной модульной архитектуре с использованием 8 микросервисов, публичного SPA-приложения и серверной панели администрирования.

---

## Стек технологий

### **Backend (Microservices)**
- **Runtime:** `Node.js` (v18+)
- **Framework:** `Express.js`
- **Language:** `TypeScript`
- **Database ORM:** `TypeORM`
- **API Documentation:** `Swagger / OpenAPI 3.0`
- **Security:** `JWT (JSON Web Tokens)`, `bcrypt`

### **Frontend (Public Application)**
- **Framework:** `Vue 3` (Composition API)
- **Build Tool:** `Vite`
- **UI Library:** `PrimeVue` + `PrimeIcons`
- **State Management:** `Pinia`
- **Router:** `Vue Router`
- **Styling:** `Vanilla CSS` + `PrimeVue Designer`

### **Admin Panel (SSR)**
- **Engine:** `Express.js` + `Pug` (Server Side Rendering)
- **Session Management:** `express-session` + `connect-pg-simple` (PostgreSQL session store)
- **Architecture:** `PRG (Post-Redirect-Get)` pattern

### **Infrastructure & DevOps**
- **Containerization:** `Docker`, `Docker Compose`
- **Gateway:** `http-proxy-middleware` (API Gateway с верификацией JWT и агрегацией документации)
- **Database:** `PostgreSQL 16` (изоляция сервисов на уровне DB Schema)

---

## Архитектура сервисов

Проект разделен на функциональные блоки, каждый из которых работает в своем контейнере:

| Сервис | Порт (внутр.) | Роль и ответственность |
|:---|:---:|:---|
| **gateway-service** | `3010` | Единая точка входа. Проверка JWT, проксирование запросов, Swagger UI. |
| **auth-service** | `3001` | Управление модераторами, авторизация в админке, внутреннее API пользователей. |
| **catalog-service** | `3002` | Управление категориями и объявлениями (модераторская часть). |
| **billing-service** | `3003` | Управление платными услугами и монетизацией объявлений. |
| **export-service** | `3004` | Генерация и стриминг CSV-отчетов (агрегирует данные Catalog + Auth). |
| **dashboard-service**| `3005` | Сбор аналитики и статистики для главной страницы админки. |
| **public-api** | `3006` | Полноценный API для обычных пользователей (регистрация, профиль, объявления). |
| **ssr-admin** | `4000` | Панель модератора с серверным рендерингом страниц. |
| **frontend-public** | `5174` | Публичный интерфейс площадки (Vue 3 SPA). |

---

## База данных

Проект использует единый инстанс **PostgreSQL**, но строго разделяет данные между сервисами с помощью **схем**:
- `auth`: данные пользователей-модераторов.
- `catalog`: категории, объявления, фотографии.
- `billing`: данные о платных услугах.
- `public_api`: независимая схема для данных обычных пользователей и их объявлений.
- `public`: системные таблицы (например, сессии админки).

---

## Инструкция по запуску

### **Системные требования**
- Установленный **Docker** и **Docker Compose**.
- Свободные порты: `3010`, `4000`, `5174`, `5432`.

### **Быстрый запуск**

1. **Клонируйте репозиторий** (если еще не сделано):
   ```bash
   git clone <repository_url>
   cd geek-flea-market
   ```

2. **Соберите и запустите контейнеры**:
   Используйте Docker Compose для автоматической сборки всех образов и инициализации базы данных.
   ```bash
   docker-compose up --build
   ```

3. **Дождитесь завершения инициализации**:
   База данных будет автоматически создана и заполнена начальными данными из файла `./db/init.sql`.

---

## Ручной запуск Seeds

Если при старте контейнеров начальные данные не были загружены автоматически (например, БД уже существовала), выполните seed-скрипты вручную для каждого сервиса:

```bash
# Auth Service — модераторы и пользователи
docker-compose exec auth-service npm run seed

# Catalog Service — категории и объявления
docker-compose exec catalog-service npm run seed

# Billing Service — платные услуги
docker-compose exec billing-service npm run seed

# Public API — публичные пользователи и их объявления
docker-compose exec public-api npm run seed
```

> **Важно:** сервисы должны быть запущены (`docker-compose up`) перед выполнением этих команд.

---

## Доступ к приложениям

| Приложение | URL | Описание |
|:---|:---|:---|
| **Public Frontend** | [http://localhost:5174](http://localhost:5174) | Главный сайт для пользователей. |
| **Admin Panel** | [http://localhost:4000](http://localhost:4000) | Панель модератора (вход через логин/пароль). |
| **API Gateway** | [http://localhost:3010](http://localhost:3010) | Базовый URL для всех API запросов. |
| **API Documentation**| [http://localhost:3010/api/docs](http://localhost:3010/api/docs) | Интерактивный Swagger (документация всех сервисов). |

---

## Тестовые данные

Для входа в панель администратора (**Admin Panel**) или тестирования API можно использовать следующие учетные данные:

| Роль | Email | Пароль |
|:---|:---|:---|
| **Модератор (Admin)** | `admin@gfm.test` | `admin123` |
| **Пользователь** | `user1@gfm.test` | `user123` |

---

## Документация API (Swagger)

Вы можете изучить и протестировать эндпоинты любого сервиса через встроенный Swagger UI на **Gateway**. В правом верхнем углу страницы можно выбрать нужный сервис (`Public API`, `Catalog Service` и т.д.) для просмотра его спецификации.

---

## Лицензия

Этот проект не предназначен для коммерческих целей. Любое коммерческое использование, частичное или полное копирование и распространение допускается **только с разрешения автора**.
