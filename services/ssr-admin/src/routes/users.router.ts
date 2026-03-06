import { Router } from 'express';
import { createGatewayClient } from '../api/gatewayClient';

const router = Router();

/**
 * GET /users
 * Отображает список пользователей.
 * Поддерживает поиск через query-параметр ?search=...
 */
router.get('/', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);
    const { search } = req.query;

    try {
        // Пробрасываем параметр поиска в Gateway (auth-service)
        const { data } = await client.get('/api/auth/users', {
            params: { search }
        });

        res.render('users', {
            users: data,
            search: search || '' // Передаем обратно в шаблон для заполнения поля поиска
        });
    } catch (error: any) {
        if (error.response?.status === 401) {
            return req.session.destroy(() => res.redirect('/login'));
        }
        console.error('Ошибка получения списка пользователей:', error.message);
        res.render('users', { users: [], error: 'Ошибка загрузки пользователей' });
    }
});

export default router;
