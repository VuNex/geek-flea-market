import { Router } from 'express';
import { ExportService } from '../services/ExportService';

const router = Router();
const exportService = new ExportService();

/**
 * @openapi
 * /api/export/adverts:
 *   get:
 *     summary: Экспорт всех объявлений в CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV файл успешно сгенерирован
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/adverts', async (req: any, res) => {
    try {
        const csvContent = await exportService.getAdvertsCsvData('', req.query);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="export_adverts.csv"');

        res.send(csvContent);
    } catch (error: any) {
        console.error('Error in GET /export/adverts:', error.message);
        res.status(500).json({ message: 'Ошибка при генерации экспорта' });
    }
});

export default router;
