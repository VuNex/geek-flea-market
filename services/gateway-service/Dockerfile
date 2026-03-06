# Этап 1: Сборка зависимостей и компиляция
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Компиляция TypeScript в JavaScript (ожидается наличие скрипта build в package.json)
RUN npm run build || echo "Build failed or not needed"

# Этап 2: Запуск приложения
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Копируем скомпилированные файлы или исходники в зависимости от структуры проекта
COPY --from=build /app/dist ./dist
# Если используется ts-node-dev в start скрипте, можно копировать src:
COPY --from=build /app/src ./src

EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
