import swaggerJsdoc from 'swagger-jsdoc';
import { billingSchemas } from './schemas';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Geek Flea Market — Billing Service',
            version: '1.0.0',
            description: 'Сервис биллинга и платных услуг (top/vip)',
        },
        servers: [
            {
                url: 'http://localhost:3003',
                description: 'Local Billing Service',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: billingSchemas,
        },
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
