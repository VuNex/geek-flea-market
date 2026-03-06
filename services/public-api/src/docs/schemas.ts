export const publicSchemas = {
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
    PublicAdvertListItem: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            price: { type: 'number' },
            category: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                },
            },
            photos: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        url: { type: 'string' },
                        order: { type: 'integer' },
                    },
                },
            },
            status: { type: 'string' },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            advantageType: { type: 'string', nullable: true, enum: ['top', 'vip', null] },
        },
    },
    PublicAdvertDetail: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            price: { type: 'number' },
            category: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                },
            },
            photos: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        url: { type: 'string' },
                        order: { type: 'integer' },
                    },
                },
            },
            status: { type: 'string' },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            advantageType: { type: 'string', nullable: true, enum: ['top', 'vip', null] },
            body: { type: 'string' },
            viewsCount: { type: 'integer' },
            author: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    phone: { type: 'string' },
                },
            },
        },
    },
    AdvantageService: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['vip', 'top'] },
            activatedAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
        },
    },
};
