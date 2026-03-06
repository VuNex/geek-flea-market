import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import { createProxy } from '../proxy/createProxy';

const router = Router();

const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        urls: [
            { name: 'Admin API', url: '/api/docs/admin/spec.json' },
            { name: 'Auth Service', url: '/api/docs/auth/spec.json' },
            { name: 'Catalog Service', url: '/api/docs/catalog/spec.json' },
            { name: 'Billing Service', url: '/api/docs/billing/spec.json' },
            { name: 'Export Service', url: '/api/docs/export/spec.json' },
            { name: 'Dashboard Service', url: '/api/docs/dashboard/spec.json' },
            { name: 'Public API', url: '/api/docs/public/spec.json' },
        ],
    },
};

// 1. Главная страница Swagger UI
router.use('/api/docs', swaggerUi.serve);
router.get('/api/docs', (req, res, next) => {
    swaggerUi.setup(undefined, swaggerOptions)(req, res, next);
});

// 2. Локальная спека Admin API
router.get('/api/docs/admin/spec.json', (req, res) => {
    res.json(swaggerSpec);
});

// 3. Проксирование спецификаций остальных сервисов
// Мы используем .all или .get для точных путей спецификаций, чтобы избежать проблем с обрезанием путей в router.use
router.all('/api/docs/auth/spec.json', createProxy('http://auth-service:3001', {
    '^/api/docs/auth/spec.json': '/docs/spec.json'
}));

router.all('/api/docs/catalog/spec.json', createProxy('http://catalog-service:3002', {
    '^/api/docs/catalog/spec.json': '/docs/spec.json'
}));

router.all('/api/docs/billing/spec.json', createProxy('http://billing-service:3003', {
    '^/api/docs/billing/spec.json': '/docs/spec.json'
}));

router.all('/api/docs/export/spec.json', createProxy('http://export-service:3004', {
    '^/api/docs/export/spec.json': '/docs/spec.json'
}));

router.all('/api/docs/dashboard/spec.json', createProxy('http://dashboard-service:3005', {
    '^/api/docs/dashboard/spec.json': '/docs/spec.json'
}));

router.all('/api/docs/public/spec.json', createProxy('http://public-api:3006', {
    '^/api/docs/public/spec.json': '/docs/spec.json'
}));

export default router;
