import { Router } from 'express';
import { CategoryService } from '../services/CategoryService';

const router = Router();
const categoryService = new CategoryService();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Список категорий
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 */
router.get('/', async (req, res) => {
    try {
        const categories = await categoryService.getAll();
        res.json(categories);
    } catch (error) {
        console.error('Error in GET /categories:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Создать категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Созданная категория
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400:
 *         description: Некорректные параметры
 *       409:
 *         description: Категория с таким именем уже существует
 */
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Необходимо указать название категории' });
            return;
        }

        const newCategory = await categoryService.create(name);
        res.status(201).json(newCategory);
    } catch (error: any) {
        console.error('Error in POST /categories:', error);
        if (error.code === '23505') { // Postgres unique constraint violation
            res.status(409).json({ message: 'Категория с таким именем уже существует' });
            return;
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Обновить категорию
 *     tags: [Categories]
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
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Обновленная категория
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400:
 *         description: Некорректные параметры
 *       404:
 *         description: Категория не найдена
 *       409:
 *         description: Категория с таким именем уже существует
 */
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name } = req.body;

        if (isNaN(id) || !name || typeof name !== 'string') {
            res.status(400).json({ message: 'Некорректные параметры' });
            return;
        }

        const updatedCategory = await categoryService.update(id, name);
        res.json(updatedCategory);
    } catch (error: any) {
        console.error('Error in PUT /categories/:id:', error);
        if (error.message === 'Category not found') {
            res.status(404).json({ message: 'Категория не найдена' });
            return;
        }
        if (error.code === '23505') {
            res.status(409).json({ message: 'Категория с таким именем уже существует' });
            return;
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Удалить категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Категория успешно удалена (хотя тут 200, можно указать как есть)
 *       400:
 *         description: Некорректные параметры
 *       404:
 *         description: Категория не найдена
 *       409:
 *         description: Конфликт (есть связанные объявления)
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }

        await categoryService.delete(id);
        res.json({ message: 'Категория успешно удалена' });
    } catch (error: any) {
        console.error('Error in DELETE /categories/:id:', error);
        if (error.message === 'Category not found') {
            res.status(404).json({ message: 'Категория не найдена' });
            return;
        }
        if (error.name === 'ConflictError') {
            res.status(409).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
