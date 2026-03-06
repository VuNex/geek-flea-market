export const billingSchemas = {
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
