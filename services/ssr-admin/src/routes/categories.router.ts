import { Router } from 'express';
import { createGatewayClient } from '../api/gatewayClient';

const router = Router();

/**
 * GET /categories
 * Отображает список всех категорий и форму добавления.
 */
router.get('/', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);

    try {
        const { data } = await client.get('/api/categories');
        res.render('categories', { categories: data });
    } catch (error: any) {
        if (error.response?.status === 401) {
            return req.session.destroy(() => res.redirect('/login'));
        }
        console.error('Ошибка получения категорий:', error.message);
        res.render('categories', { categories: [], error: 'Ошибка загрузки категорий' });
    }
});

/**
 * POST /categories
 * Создание новой категории.
 */
router.post('/', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);
    const { name } = req.body;

    try {
        await client.post('/api/categories', { name });
        session.flashSuccess = `Категория "${name}" успешно создана`;
    } catch (error: any) {
        session.flashError = 'Не удалось создать категорию';
    }
    // PRG: Redirect после POST
    res.redirect('/categories');
});

/**
 * POST /categories/:id/edit
 * Обновление названия категории.
 */
router.post('/:id/edit', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);
    const { id } = req.params;
    const { name } = req.body;

    try {
        await client.put(`/api/categories/${id}`, { name });
        session.flashSuccess = 'Категория обновлена';
    } catch (error: any) {
        session.flashError = 'Ошибка при обновлении категории';
    }
    res.redirect('/categories');
});

/**
 * POST /categories/:id/delete
 * Удаление категории.
 */
router.post('/:id/delete', async (req, res) => {
    const session = req.session as any;
    const client = createGatewayClient(session.token);
    const { id } = req.params;

    try {
        await client.delete(`/api/categories/${id}`);
        session.flashSuccess = 'Категория удалена';
    } catch (error: any) {
        // 409 Conflict — к категории привязаны объявления (бизнес-правило)
        if (error.response?.status === 409) {
            session.flashError = 'Нельзя удалить: к категории привязаны объявления';
        } else {
            session.flashError = 'Ошибка при удалении категории';
        }
    }
    res.redirect('/categories');
});

export default router;
