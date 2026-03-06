import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import categoriesRouter from './routes/categories.router';
import advertsRouter from './routes/adverts.router';
import internalRouter from './routes/internal.router';
import publicCategoriesRouter from './routes/public.categories.router';
import publicAdvertsRouter from './routes/public.adverts.router';

import { swaggerSpec } from './docs/swagger.config';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Спецификация Swagger для интеграции с Gateway
app.get('/docs/spec.json', (req, res) => res.json(swaggerSpec));

app.use('/internal', internalRouter);

app.use('/api/public/categories', publicCategoriesRouter);
app.use('/api/public/adverts', publicAdvertsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/adverts', advertsRouter);

AppDataSource.initialize()
    .then(() => {
        console.log('AppDataSource for catalog-service initialized');
        app.listen(PORT, () => {
            console.log(`Catalog-service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error during AppDataSource initialization:', err);
    });
