import express from 'express';
import cors from 'cors';
import exportRouter from './routes/export.router';

import { swaggerSpec } from './docs/swagger.config';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Спецификация Swagger для интеграции с Gateway
app.get('/docs/spec.json', (req, res) => res.json(swaggerSpec));

// Основной эндпоинт экспорта
app.use('/api/export', exportRouter);

app.listen(PORT, () => {
    console.log(`Export-service is running on port ${PORT}`);
});
