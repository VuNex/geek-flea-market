export const commonSchemas = {
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
    PaidService: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            type: { type: 'string' },
            activatedAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
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
            paidServices: {
                type: 'array',
                items: { $ref: '#/components/schemas/PaidService' },
            },
        },
    },
    DashboardStats: {
        type: 'object',
        properties: {
            currentUser: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                },
            },
            advertsByStatus: {
                type: 'object',
                properties: {
                    moderation: { type: 'integer' },
                    published: { type: 'integer' },
                    rejected: { type: 'integer' },
                },
            },
            usersCount: { type: 'integer' },
            topAdverts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        views: { type: 'integer' },
                        category: { type: 'string' },
                        price: { type: 'number' },
                    },
                },
            },
        },
    },
    Error: {
        type: 'object',
        properties: {
            message: { type: 'string' },
        },
    },
    ValidationError: {
        type: 'object',
        properties: {
            message: { type: 'string' },
            errors: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    },
};
