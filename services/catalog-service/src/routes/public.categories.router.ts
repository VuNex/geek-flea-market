import { Router } from 'express';
import { CategoryService } from '../services/CategoryService';

const router = Router();
const categoryService = new CategoryService();

/**
 * @openapi
 * /api/public/categories:
 *   get:
 *     summary: Список категорий (публичный API)
 *     tags: [Public Categories]
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

export default router;
