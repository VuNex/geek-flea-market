import express from 'express';
import cors from 'cors';
import dashboardRouter from './routes/dashboard.router';

import { swaggerSpec } from './docs/swagger.config';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Спецификация Swagger для интеграции с Gateway
app.get('/docs/spec.json', (req, res) => res.json(swaggerSpec));

// Основной эндпоинт агрегации
app.use('/api/dashboard', dashboardRouter);

app.listen(PORT, () => {
    console.log(`Dashboard-service is running on port ${PORT}`);
});
