export const dashboardSchemas = {
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
};
