import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Geek Flea Market — Export Service',
            version: '1.0.0',
            description: 'Сервис экспорта данных (CSV)',
        },
        servers: [
            {
                url: 'http://localhost:3004',
                description: 'Local Export Service',
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
        },
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
