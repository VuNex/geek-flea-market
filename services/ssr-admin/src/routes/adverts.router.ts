import { Router } from 'express';
import { createGatewayClient } from '../api/gatewayClient';

const router = Router();

/**
 * ВНИМАНИЕ: Маршрут /export должен быть зарегистрирован ДО /:id,
 * иначе Express примет его за ID объявления.
 */
router.get('/export', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);

    try {
        // Запрашиваем поток данных от Gateway (сервис экспорта)
        const response = await client.get('/api/adverts/export', {
            params: req.query,
            responseType: 'stream'
        });

        // Проксируем заголовки и поток напрямую клиенту без буферизации
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="export_adverts.csv"');
        response.data.pipe(res);
    } catch (error: any) {
        console.error('Ошибка экспорта CSV:', error.message);
        res.status(500).send('Ошибка при генерации файла экспорта');
    }
});

/**
 * GET /adverts
 * Список объявлений с фильтрами.
 */
router.get('/', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);

    try {
        // Запрашиваем параллельно объявления и категории для фильтра
        const [advertsRes, categoriesRes] = await Promise.all([
            client.get('/api/adverts', { params: req.query }),
            client.get('/api/categories')
        ]);

        res.render('adverts', {
            adverts: advertsRes.data,
            categories: categoriesRes.data,
            filters: req.query // Возвращаем фильтры для сохранения состояния в форме
        });
    } catch (error: any) {
        if (error.response?.status === 401) {
            return req.session.destroy(() => res.redirect('/login'));
        }
        res.render('adverts', { adverts: [], categories: [], filters: {}, error: 'Ошибка загрузки объявлений' });
    }
});

/**
 * GET /adverts/:id
 * Детальная страница объявления: данные автора, фото, модерация и услуги.
 */
router.get('/:id', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);
    const { id } = req.params;

    try {
        // Получаем данные объявления и список платных услуг (биллинг) параллельно
        const [advertRes, billingRes] = await Promise.all([
            client.get(`/api/adverts/${id}`),
            client.get(`/api/billing/adverts/${id}/services`).catch(() => ({ data: [] }))
        ]);

        const advert = advertRes.data;

        // Запрашиваем данные автора объявления из auth-service
        // authorId может храниться в поле authorId или userId
        const authorId = advert.authorId ?? advert.userId;
        let user: any = null;
        if (authorId) {
            try {
                const userRes = await client.get(`/api/auth/users/${authorId}`);
                user = userRes.data;
            } catch {
                // Если auth-service недоступен — формируем заглушку, чтобы шаблон не упал
                user = { id: authorId, name: `Пользователь #${authorId}`, phone: '—', email: '—' };
            }
        }

        res.render('advert-detail', {
            advert: { ...advert, user },
            billing: billingRes.data
        });
    } catch (error: any) {
        if (error.response?.status === 404) {
            return res.status(404).send('Объявление не найдено');
        }
        console.error('Ошибка загрузки деталей объявления:', error.message);
        res.redirect('/adverts');
    }
});

/**
 * POST /adverts/:id/status
 * Смена статуса (модерация).
 */
router.post('/:id/status', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);
    const { id } = req.params;
    const { status } = req.body;

    try {
        await client.patch(`/api/adverts/${id}/status`, { status });
        session.flashSuccess = `Статус объявления изменен на "${status}"`;
    } catch (error: any) {
        session.flashError = 'Не удалось изменить статус';
    }
    res.redirect(`/adverts/${id}`);
});

/**
 * POST /adverts/:id/services/:serviceId
 * Включение/выключение платной услуги.
 */
router.post('/:id/services/:serviceId', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);
    const { id, serviceId } = req.params;
    const { isActive } = req.body; // Ожидается 'true' или 'false' из формы

    try {
        await client.patch(`/api/billing/adverts/${id}/services/${serviceId}`, {
            isActive: isActive === 'true'
        });
        session.flashSuccess = 'Состояние услуги обновлено';
    } catch (error: any) {
        session.flashError = 'Ошибка при управлении услугой';
    }
    res.redirect(`/adverts/${id}`);
});

export default router;
