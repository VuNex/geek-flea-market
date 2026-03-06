import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT';
import { requireModerator } from '../middleware/requireModerator';
import { createProxy } from '../proxy/createProxy';

const router = Router();

const {
    AUTH_SERVICE_URL = 'http://auth-service:3001',
    CATALOG_SERVICE_URL = 'http://catalog-service:3002',
    BILLING_SERVICE_URL = 'http://billing-service:3003',
    EXPORT_SERVICE_URL = 'http://export-service:3004',
    DASHBOARD_SERVICE_URL = 'http://dashboard-service:3005'
} = process.env;

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Вход модератора
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/api/auth/login', createProxy(AUTH_SERVICE_URL));

router.all('/api/public/auth*', createProxy(AUTH_SERVICE_URL));
router.all('/api/public/categories*', createProxy(CATALOG_SERVICE_URL));
router.all('/api/public/adverts*', createProxy(CATALOG_SERVICE_URL));
router.all('/api/public/billing*', createProxy(BILLING_SERVICE_URL));

router.use(verifyJWT);
router.use((req, res, next) => {
    if (req.path.startsWith('/api/docs/')) return next();
    requireModerator(req, res, next);
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Профиль текущего модератора
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные профиля
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 */
router.get('/api/auth/me', createProxy(AUTH_SERVICE_URL));

/**
 * @openapi
 * /api/auth/users:
 *   get:
 *     summary: Список пользователей
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get('/api/auth/users', createProxy(AUTH_SERVICE_URL));

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Сводная статистика
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика для дашборда
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/DashboardStats' }
 */
router.get('/api/dashboard', createProxy(DASHBOARD_SERVICE_URL));

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Список категорий
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 */
router.get('/api/categories', createProxy(CATALOG_SERVICE_URL));

/**
 * @openapi
 * /api/adverts/export:
 *   get:
 *     summary: Скачать CSV со всеми объявлениями
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV файл
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/api/adverts/export', createProxy(EXPORT_SERVICE_URL, {
    '^/api/adverts/export': '/api/export/adverts'
}));

/**
 * @openapi
 * /api/adverts:
 *   get:
 *     summary: Список объявлений с фильтрами
 *     tags: [Adverts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [moderation, published, rejected] }
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Список объявлений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/AdvertListItem' }
 */
router.all('/api/adverts*', createProxy(CATALOG_SERVICE_URL));

router.all('/api/billing*', createProxy(BILLING_SERVICE_URL));

export default router;
