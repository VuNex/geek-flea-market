FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json из корня сервиса
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Открываем порт
EXPOSE 3005

# Запуск приложения
CMD ["npm", "start"]
