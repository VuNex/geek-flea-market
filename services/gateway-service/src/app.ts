import express from 'express';
import cors from 'cors';
import docsRouter from './docs/docs.router';
import gatewayRouter from './routes/gateway.router';

/**
 * Инициализация API Gateway.
 * Сервис служит единой точкой входа для фронтенда и распределяет
 * запросы между микросервисами.
 */
const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем CORS
app.use(cors());

// Используем стандартные middleware Express
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.path}`);
    next();
});

// Мы НЕ используем express.json() глобально для проксирования.

// Документация API (Swagger)
app.use(docsRouter);

// Подключение таблицы маршрутизации Gateway
// Здесь сосредоточена вся логика верификации JWT и проксирования.
app.use(gatewayRouter);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});

export default app;
