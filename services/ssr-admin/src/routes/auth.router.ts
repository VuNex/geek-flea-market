import { Router } from 'express';
import { createGatewayClient } from '../api/gatewayClient';

const router = Router();

/**
 * GET /login
 * Отображает страницу входа. 
 * Если пользователь уже авторизован, перенаправляет на главную.
 */
router.get('/login', (req, res) => {
    if (req.session && req.session.token) {
        return res.redirect('/');
    }
    res.render('login');
});

/**
 * POST /login
 * Обрабатывает попытку входа.
 * Вызывает API Gateway, при успехе сохраняет JWT в сессию.
 * Реализует PRG-паттерн через редиректы.
 */
router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    const session = req.session as any;

    try {
        // Для логина создаем клиент без токена
        const client = createGatewayClient();
        const response = await client.post('/api/auth/login', { login, password });

        if (response.status === 200) {
            // Сохраняем данные в серверную сессию
            session.token = response.data.token;
            session.user = response.data.user;

            // После POST всегда Redirect (PRG)
            return res.redirect('/');
        }
    } catch (error: any) {
        // В случае ошибки (401, 403 или сетевая ошибка)
        session.flashError = 'Неверный логин или пароль';
        return res.redirect('/login');
    }
});

/**
 * POST /logout
 * Завершает сессию и перенаправляет на страницу входа.
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе из системы:', err);
        }
        res.redirect('/login');
    });
});

export default router;
