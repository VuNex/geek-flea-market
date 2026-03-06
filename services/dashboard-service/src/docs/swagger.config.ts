import swaggerJsdoc from 'swagger-jsdoc';
import { dashboardSchemas } from './schemas';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Geek Flea Market — Dashboard Service',
            version: '1.0.0',
            description: 'Сервис агрегации статистики',
        },
        servers: [
            {
                url: 'http://localhost:3005',
                description: 'Local Dashboard Service',
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
            schemas: dashboardSchemas,
        },
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
