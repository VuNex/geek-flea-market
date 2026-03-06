import swaggerJsdoc from 'swagger-jsdoc';
import { publicSchemas } from './schemas';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Geek Flea Market — Public API',
            version: '1.0.0',
            description: 'Публичный API для пользователей платформы',
        },
        servers: [
            {
                url: 'http://localhost:3006',
                description: 'Local Public API',
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
            schemas: publicSchemas,
        },
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
