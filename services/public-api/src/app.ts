import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { swaggerSpec } from './docs/swagger.config';
import authRouter from './routes/auth.router';
import categoriesRouter from './routes/categories.router';
import advertsRouter from './routes/adverts.router';
import { AppDataSource } from './database/data-source';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

// Спецификация Swagger для интеграции с Gateway
app.get('/docs/spec.json', (req: any, res: any) => res.json(swaggerSpec));

app.use('/api/public/auth', authRouter);
app.use('/api/public/categories', categoriesRouter);
app.use('/api/public/adverts', advertsRouter);

AppDataSource.initialize()
    .then(() => {
        console.log('AppDataSource for public-api initialized');
        app.listen(PORT, () => {
            console.log(`Public-API is running on port ${PORT}`);
        });
    })
    .catch((err: any) => {
        console.error('Error during AppDataSource initialization:', err);
    });

export default app;
