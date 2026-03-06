import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth.router';
import usersRouter from './routes/users.router';
import internalRouter from './routes/internal.router';
import publicRouter from './routes/public.router';

import { swaggerSpec } from './docs/swagger.config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Спецификация Swagger для интеграции с Gateway
app.get('/docs/spec.json', (req, res) => res.json(swaggerSpec));

app.use((req, res, next) => {
    console.log(`[Auth-Service] ${req.method} ${req.path}`);
    next();
});

app.use('/internal', internalRouter);

app.use('/api/public/auth', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth/users', usersRouter);

AppDataSource.initialize()
    .then(() => {
        console.log('AppDataSource for auth-service string initialized');
        app.listen(PORT, () => {
            console.log(`Auth-service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error during AppDataSource initialization:', err);
    });
