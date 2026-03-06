export const authSchemas = {
    User: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            publishedAdvertsCount: { type: 'integer' },
        },
    },
    PublicUser: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'moderator'] },
            createdAt: { type: 'string', format: 'date-time' },
        },
    },
};
