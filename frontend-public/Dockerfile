# Этап 1: Сборка статических файлов
FROM node:20-alpine as build-stage

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей (включая dev-зависимости для сборки)
RUN npm install

# Копирование всех исходников проекта
COPY . .

# Сборка приложения для продакшена с использованием Vite
RUN npm run build

# Этап 2: Финальный образ на базе nginx для отдачи статики
FROM nginx:stable-alpine as production-stage

# Удаляем стандартную страницу nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем скомпилированную статику из первого этапа
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копирование конфига nginx для правильной работы SPA маршрутизации
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Порт для работы контейнера
EXPOSE 80

# Старт nginx в качестве основного процесса
CMD ["nginx", "-g", "daemon off;"]
