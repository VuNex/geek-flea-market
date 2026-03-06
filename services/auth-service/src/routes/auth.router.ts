import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const router = Router();
const authService = new AuthService();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Вход модератора
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверный логин или пароль
 *       403:
 *         description: Доступ запрещен (не модератор)
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            res.status(401).json({ message: 'Неверный логин или пароль' });
            return;
        }

        const result = await authService.login(login, password);

        if (!result) {
            res.status(401).json({ message: 'Неверный логин или пароль' });
            return;
        }

        // Дополнительная секьюрность, в спеке написано "Панель доступна исключительно пользователям с ролью модератора"
        if (result.user.role !== 'moderator') {
            res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
            return;
        }

        res.json(result);
    } catch (error) {
        console.error('Error in POST /login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Профиль текущего модератора
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные профиля
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Не авторизован
 */
router.get('/me', async (req: Request, res: Response) => {
    try {
        const userId = Number(req.headers['x-user-id']);

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await authService.getUserById(userId);
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Error in GET /me:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
