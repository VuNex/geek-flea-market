import { Router } from 'express';
import { createGatewayClient } from '../api/gatewayClient';

const router = Router();

/**
 * GET /
 * Главная страница (Дашборд).
 * Запрашивает статистику (счетчики и ТОП объявлений) через API Gateway.
 */
router.get('/', async (req, res) => {
    const session = req.session as any;
    const token = session.token;

    // Создаем клиент с токеном из сессии для авторизованного запроса
    const client = createGatewayClient(token);

    try {
        // Получаем данные для дашборда (счетчики и ТОП-10 по просмотрам)
        const { data } = await client.get('/api/dashboard');

        // Рендерим шаблон dashboard.pug, маппим данные под ожидания шаблона
        res.render('dashboard', {
            user: session.user,
            stats: {
                counters: {
                    moderation: data.advertsByStatus?.moderation || 0,
                    published: data.advertsByStatus?.published || 0,
                    rejected: data.advertsByStatus?.rejected || 0,
                    users: data.usersCount || 0
                },
                topAdverts: data.topAdverts || []
            }
        });
    } catch (error: any) {
        // Если токен протух или невалиден (401 от Gateway)
        if (error.response?.status === 401) {
            return req.session.destroy(() => {
                res.redirect('/login');
            });
        }

        console.error('Ошибка при загрузке дашборда:', error.message);

        // В случае ошибки сервера показываем пустой дашборд с уведомлением
        res.render('dashboard', {
            user: session.user,
            stats: {
                counters: { moderation: 0, published: 0, rejected: 0, users: 0 },
                topAdverts: []
            },
            error: 'Не удалось загрузить данные статистики'
        });
    }
});

export default router;
