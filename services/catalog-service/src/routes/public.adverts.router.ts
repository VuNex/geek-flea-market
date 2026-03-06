import { Router, Request, Response } from 'express';
import { AdvertService } from '../services/AdvertService';
import jwt from 'jsonwebtoken';

const router = Router();
const advertService = new AdvertService();

// Middleware для авторизации публичного API
const verifyPublicJWT = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET || 'supersecret';
        req.user = jwt.verify(token, secret);
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

/**
 * @openapi
 * /api/public/adverts:
 *   get:
 *     summary: Список объявлений (публичный)
 *     tags: [Public Adverts]
 *     parameters:
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
        const categoryId = req.query.categoryId as string | undefined;
        const search = req.query.search as string | undefined;

        // publicOnly = true: без указания статуса показываем только 'published'
        const adverts = await advertService.getAll(undefined, categoryId, search, true);
        res.json(adverts);
    } catch (error) {
        console.error('Error in GET /public/adverts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/**
 * @openapi
 * /api/public/adverts/my:
 *   get:
 *     summary: Мои объявления
 *     tags: [Public Adverts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Список объявлений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/AdvertListItem' }
 *       401:
 *         description: Не авторизован
 */
router.get('/my', verifyPublicJWT, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const status = req.query.status as string | undefined;

        const adverts = await advertService.getAllByAuthor(userId, status);
        res.json(adverts);
    } catch (error) {
        console.error('Error in GET /public/adverts/my:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/public/adverts/{id}:
 *   get:
 *     summary: Детальное объявление (публичный)
 *     tags: [Public Adverts]
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
        res.json({
            ...advert,
            author: { id: advert.authorId, name: `User ${advert.authorId}`, phone: '77770000000' }
        });
    } catch (error) {
        console.error('Error in GET /public/adverts/:id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/public/adverts:
 *   post:
 *     summary: Создать объявление
 *     tags: [Public Adverts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *               price: { type: number }
 *               categoryId: { type: integer }
 *               photos: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Создано
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.post('/', verifyPublicJWT, async (req: any, res: Response) => {

    try {
        const userId = req.user.id;
        const { title, body, price, categoryId, photos } = req.body;

        if (!title || !body || isNaN(price) || isNaN(categoryId)) {
            res.status(400).json({ message: 'Некорректные параметры' });
            return;
        }

        const photoUrls = photos ? photos.map((p: any) => typeof p === 'string' ? p : p.url) : [];

        const newAdvert = await advertService.create({
            title, body, price: Number(price), categoryId: Number(categoryId), authorId: userId, photos: photoUrls
        });

        res.status(201).json(newAdvert);
    } catch (error) {
        console.error('Error in POST /public/adverts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/public/adverts/{id}:
 *   patch:
 *     summary: Редактировать объявление
 *     tags: [Public Adverts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *               price: { type: number }
 *               categoryId: { type: integer }
 *               photos: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Обновлено
 *       403:
 *         description: Нельзя редактировать
 *       404:
 *         description: Не найдено
 */
router.patch('/:id', verifyPublicJWT, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);

        const advert = await advertService.getById(id);
        if (!advert || advert.authorId !== userId) {
            res.status(404).json({ message: 'Объявление не найдено или нет прав' });
            return;
        }

        if (advert.status !== 'draft') {
            res.status(403).json({ message: 'Можно редактировать только черновик' });
            return;
        }

        const { title, body, price, categoryId, photos } = req.body;
        const photoUrls = photos ? photos.map((p: any) => typeof p === 'string' ? p : p.url) : undefined;
        const updated = await advertService.update(id, { title, body, price, categoryId, photos: photoUrls });

        res.json(updated);
    } catch (error) {
        console.error('Error in PATCH /public/adverts/:id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/public/adverts/{id}/status:
 *   patch:
 *     summary: Изменить статус
 *     tags: [Public Adverts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Обновлено
 *       404:
 *         description: Не найдено
 *       422:
 *         description: Ошибка валидации
 */
router.patch('/:id/status', verifyPublicJWT, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);
        const { status } = req.body;

        const updated = await advertService.updatePublicStatus(id, status, userId);
        if (!updated) {
            res.status(404).json({ message: 'Объявление не найдено или нет прав' });
            return;
        }
        res.json(updated);
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(422).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/public/adverts/{id}:
 *   delete:
 *     summary: Удалить объявление
 *     tags: [Public Adverts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Удалено
 *       403:
 *         description: Можно удалять только заархивированные
 *       404:
 *         description: Не найдено
 */
router.delete('/:id', verifyPublicJWT, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);

        const advert = await advertService.getById(id);
        if (!advert || advert.authorId !== userId) {
            res.status(404).json({ message: 'Объявление не найдено или нет прав' });
            return;
        }
        if (advert.status !== 'archived') {
            res.status(403).json({ message: 'Можно удалять только заархивированные объявления' });
            return;
        }

        await advertService.delete(id);
        res.json({ message: 'Объявление удалено' });
    } catch (error) {
        console.error('Error in DELETE /public/adverts/:id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
