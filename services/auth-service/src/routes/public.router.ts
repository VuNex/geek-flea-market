import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const authService = new AuthService();

/**
 * @openapi
 * /api/public/auth/login:
 *   post:
 *     summary: Вход (публичный API)
 *     tags: [Public Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login: { type: string, description: "Email или телефон" }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверный логин или пароль
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

        // В публичном API нет проверки на роль модератора
        res.json(result);
    } catch (error) {
        console.error('Error in POST /public/login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/public/auth/register:
 *   post:
 *     summary: Регистрация (публичный API)
 *     tags: [Public Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Конфликт (email или телефон занят)
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !email || !password) {
            res.status(400).json({ message: 'Все поля обязательны' });
            return;
        }

        const success = await authService.register({ name, phone, email, passwordPlain: password });
        if (!success) {
            res.status(409).json({ message: 'Email или телефон уже зарегистрирован' });
            return;
        }

        res.status(201).json({ message: 'User created' });
    } catch (error) {
        console.error('Error in POST /public/register:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

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
 * /api/public/auth/profile:
 *   get:
 *     summary: Мой профиль (публичный API)
 *     tags: [Public Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные профиля
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PublicUser' }
 *       401:
 *         description: Не авторизован
 */
router.get('/profile', verifyPublicJWT, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await authService.getUserById(userId);
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error('Error in GET /public/profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/public/auth/profile:
 *   patch:
 *     summary: Обновить профиль (публичный API)
 *     tags: [Public Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Профиль обновлен
 *       401:
 *         description: Не авторизован
 *       409:
 *         description: Конфликт (email или телефон занят)
 */
router.patch('/profile', verifyPublicJWT, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, phone, email } = req.body;
        const user = await authService.updateProfile(userId, { name, phone, email });
        if (!user) {
            res.status(409).json({ message: 'Email или телефон уже используется' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error('Error in PATCH /public/profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
