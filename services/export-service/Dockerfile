FROM node:18-alpine

WORKDIR /app

# Копируем package.json из корня сервиса
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Проброс порта 3004
EXPOSE 3004

CMD ["npm", "start"]
