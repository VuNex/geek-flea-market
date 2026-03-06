import { Router } from 'express';
import { AdvertService } from '../services/AdvertService';

const router = Router();
const advertService = new AdvertService();

// Важно объявлять статические пути до путей с параметрами (как /:id)
// GET /api/adverts/stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await advertService.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error in GET /adverts/stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/adverts/top
router.get('/top', async (req, res) => {
    try {
        const topAdverts = await advertService.getTop();
        res.json(topAdverts);
    } catch (error) {
        console.error('Error in GET /adverts/top:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/adverts:
 *   get:
 *     summary: Список объявлений с фильтрами (admin)
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
router.get('/', async (req, res) => {
    try {
        const status = req.query.status as string | undefined;
        const categoryId = req.query.categoryId as string | undefined;
        const search = req.query.search as string | undefined;

        const adverts = await advertService.getAll(status, categoryId, search);
        res.json(adverts);
    } catch (error) {
        console.error('Error in GET /adverts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/adverts/{id}:
 *   get:
 *     summary: Детальное объявление (admin)
 *     tags: [Adverts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Данные объявления
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdvertDetail' }
 *       404:
 *         description: Объявление не найдено
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }

        const advert = await advertService.getById(id);
        if (!advert) {
            res.status(404).json({ message: 'Объявление не найдено' });
            return;
        }

        res.json(advert);
    } catch (error) {
        console.error('Error in GET /adverts/:id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/adverts/{id}/status:
 *   patch:
 *     summary: Изменить статус объявления (admin)
 *     tags: [Adverts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [moderation, published, rejected] }
 *     responses:
 *       200:
 *         description: Обновленное объявление
 *       400:
 *         description: Некорректные параметры
 *       404:
 *         description: Объявление не найдено
 *       422:
 *         description: Ошибка валидации статуса
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (isNaN(id) || !status || typeof status !== 'string') {
            res.status(400).json({ message: 'Некорректные параметры' });
            return;
        }

        const updatedAdvert = await advertService.updateStatus(id, status);

        if (!updatedAdvert) {
            res.status(404).json({ message: 'Объявление не найдено' });
            return;
        }

        res.json(updatedAdvert);
    } catch (error: any) {
        console.error(`Error in PATCH /adverts/${req.params.id}/status:`, error);
        if (error.name === 'ValidationError') {
            res.status(422).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
