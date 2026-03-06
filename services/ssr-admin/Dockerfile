# Используем стабильную версию Node.js на базе Alpine
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем манифесты зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код и шаблоны
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build

# Открываем порт, указанный в спецификации
EXPOSE 4000

# Запускаем приложение
CMD ["npm", "start"]
