import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import billingRouter from './routes/billing.router';
import { swaggerSpec } from './docs/swagger.config';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Спецификация Swagger для интеграции с Gateway
app.get('/docs/spec.json', (req, res) => res.json(swaggerSpec));

app.use('/api/billing', billingRouter);

AppDataSource.initialize()
    .then(() => {
        console.log('AppDataSource for billing-service initialized');
        app.listen(PORT, () => {
            console.log(`Billing-service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error during AppDataSource initialization:', err);
    });
