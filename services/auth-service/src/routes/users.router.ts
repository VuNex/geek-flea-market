import { Router } from 'express';
import { AuthService } from '../services/AuthService';

const router = Router();
const authService = new AuthService();

/**
 * @openapi
 * /api/auth/users/count:
 *   get:
 *     summary: Общее количество пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Количество пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 */
router.get('/count', async (req, res) => {
    try {
        const count = await authService.getUsersCount();
        res.json({ count });
    } catch (error) {
        console.error('Error in GET /users/count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/auth/users/search:
 *   get:
 *     summary: Поиск по id/phone/email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: "Точное совпадение по id, phone или email"
 *     responses:
 *       200:
 *         description: Список найденных пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get('/search', async (req, res) => {
    try {
        const { search } = req.query;

        // Если search пустой, возвращаем всех
        if (!search || typeof search !== 'string') {
            const users = await authService.getAllUsers();
            res.json(users);
            return;
        }

        const users = await authService.searchUsers(search);
        res.json(users);
    } catch (error) {
        console.error('Error in GET /users/search:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/auth/users:
 *   get:
 *     summary: Список всех пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema: { type: string }
 *         description: "Список ID через запятую"
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get('/', async (req, res) => {
    try {
        const idsQuery = req.query.ids as string;

        if (idsQuery) {
            const parsedIds = idsQuery.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
            const users = await authService.getUsersByIds(parsedIds);
            res.json(users);
            return;
        }

        const users = await authService.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error in GET /users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/auth/users/{id}:
 *   get:
 *     summary: Один пользователь по ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }

        const user = await authService.getUserById(id);
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Error in GET /users/:id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
