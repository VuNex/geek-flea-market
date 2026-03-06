import swaggerJsdoc from 'swagger-jsdoc';
import { commonSchemas } from './schemas';
import path from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Geek Flea Market — Admin API',
            version: '1.0.0',
            description: 'Административные маршруты через API Gateway',
        },
        servers: [
            {
                url: 'http://localhost:3010',
                description: 'Local Gateway',
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
            schemas: commonSchemas,
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Ищем аннотации как в исходниках (для dev/docker с проброшенным src), так и в скомпилированных файлах
    apis: [
        path.join(process.cwd(), 'src/routes/*.ts'),
        path.join(process.cwd(), 'dist/routes/*.js'),
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
