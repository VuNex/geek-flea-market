export const catalogSchemas = {
    Category: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            publishedAdvertsCount: { type: 'integer' },
        },
    },
    CategoryRef: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
        },
    },
    AuthorRef: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            phone: { type: 'string' },
        },
    },
    AdvertListItem: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            status: {
                type: 'string',
                enum: ['moderation', 'published', 'rejected'],
            },
            category: { type: 'string' },
            author: { type: 'string' },
            price: { type: 'number' },
            views: { type: 'integer' },
            hasPaidService: { type: 'boolean' },
        },
    },
    AdvertPhoto: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            url: { type: 'string' },
        },
    },
    AdvertDetail: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            body: { type: 'string' },
            price: { type: 'number' },
            views: { type: 'integer' },
            status: { type: 'string' },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            category: { $ref: '#/components/schemas/CategoryRef' },
            author: { $ref: '#/components/schemas/AuthorRef' },
            photos: {
                type: 'array',
                items: { $ref: '#/components/schemas/AdvertPhoto' },
            },
        },
    },
};
