import swaggerJsdoc from 'swagger-jsdoc';
import { authSchemas } from './schemas';
import path from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Geek Flea Market — Auth Service',
            version: '1.0.0',
            description: 'Сервис аутентификации и управления пользователями',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Local Auth Service',
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
            schemas: authSchemas,
        },
    },
    apis: [
        path.join(process.cwd(), 'src/routes/*.ts'),
        path.join(process.cwd(), 'dist/routes/*.js'),
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
