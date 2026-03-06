import { Router } from 'express';
import { DashboardService } from '../services/DashboardService';

const router = Router();
const dashboardService = new DashboardService();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Дашборд (статистика) (admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика для дашборда
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/DashboardStats' }
 *       401:
 *         description: Не авторизован
 */
router.get('/', async (req, res) => {
    try {
        const userId = Number(req.headers['x-user-id']);
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const stats = await dashboardService.getAggregatedStats(userId);
        res.json(stats);
    } catch (error: any) {
        console.error('Error in GET /dashboard:', error.message);
        res.status(500).json({ message: 'Ошибка при сборе статистики' });
    }
});

export default router;
