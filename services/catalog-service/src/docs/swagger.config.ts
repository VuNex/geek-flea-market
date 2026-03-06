import swaggerJsdoc from 'swagger-jsdoc';
import { catalogSchemas } from './schemas';
import path from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Geek Flea Market — Catalog Service',
            version: '1.0.0',
            description: 'Сервис управления каталогом объявлений и категорий',
        },
        servers: [
            {
                url: 'http://localhost:3002',
                description: 'Local Catalog Service',
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
            schemas: catalogSchemas,
        },
    },
    apis: [
        path.join(process.cwd(), 'src/routes/*.ts'),
        path.join(process.cwd(), 'dist/routes/*.js'),
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
