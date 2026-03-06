import { Router } from 'express';
import { BillingService } from '../services/BillingService';

const router = Router();
const billingService = new BillingService();

/**
 * @openapi
 * /api/billing/adverts/{advertId}/services:
 *   get:
 *     summary: Платные услуги объявления (admin)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advertId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Список услуг
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/PaidService' }
 */
router.get('/adverts/:advertId/services', async (req, res) => {
    try {
        const advertId = parseInt(req.params.advertId, 10);
        if (isNaN(advertId)) {
            res.status(400).json({ message: 'Invalid advert ID' });
            return;
        }

        const services = await billingService.getServicesByAdvertId(advertId);
        res.json(services);
    } catch (error) {
        console.error('Error in GET /api/billing/adverts/:advertId/services:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /api/billing/adverts/{advertId}/services/{serviceId}:
 *   patch:
 *     summary: Вкл/откл услугу (admin)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advertId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Обновленная услуга
 *       400:
 *         description: Некорректные параметры
 *       404:
 *         description: Услуга не найдена
 */
router.patch('/adverts/:advertId/services/:serviceId', async (req, res) => {
    try {
        const advertId = parseInt(req.params.advertId, 10);
        const serviceId = parseInt(req.params.serviceId, 10);
        const { isActive } = req.body;

        if (isNaN(advertId) || isNaN(serviceId) || typeof isActive !== 'boolean') {
            res.status(400).json({ message: 'Некорректные параметры' });
            return;
        }

        const updatedService = await billingService.toggleServiceActiveStatus(advertId, serviceId, isActive);

        if (!updatedService) {
            res.status(404).json({ message: 'Услуга не найдена или не принадлежит данному объявлению' });
            return;
        }

        res.json(updatedService);
    } catch (error) {
        console.error('Error in PATCH /api/billing/adverts/:advertId/services/:serviceId:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
