import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Advert } from '../entities/Advert';

const router = Router();

/**
 * Получить статистику по статусам объявлений
 * Используется dashboard-service
 */
router.get('/adverts/stats', async (req, res) => {
    try {
        const advertRepository = AppDataSource.getRepository(Advert);
        const stats = await advertRepository
            .createQueryBuilder('advert')
            .select('advert.status', 'status')
            .addSelect('COUNT(advert.id)', 'count')
            .groupBy('advert.status')
            .getRawMany();

        // Преобразуем массив в массив объектов согласно ожиданиям dashboard-service
        const formattedStats = stats.reduce((acc, curr) => {
            acc[curr.status] = Number(curr.count);
            return acc;
        }, {} as Record<string, number>);

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * Получить ТОП-10 опубликованных объявлений по просмотрам
 * Используется dashboard-service
 */
router.get('/adverts/top', async (req, res) => {
    try {
        const advertRepository = AppDataSource.getRepository(Advert);
        const topAdverts = await advertRepository.find({
            where: { status: 'published' },
            order: { views: 'DESC' },
            take: 10,
            relations: ['category']
        });

        res.json(topAdverts);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * Получить список объявлений для экспорта
 * Используется export-service
 */
router.get('/adverts', async (req, res) => {
    try {
        const { status, categoryId, search } = (req.query as any);
        const advertRepository = AppDataSource.getRepository(Advert);

        const qb = advertRepository.createQueryBuilder('advert')
            .leftJoinAndSelect('advert.category', 'category');

        if (status) {
            qb.andWhere('advert.status = :status', { status });
        }
        if (categoryId) {
            qb.andWhere('advert.categoryId = :categoryId', { categoryId });
        }
        if (search) {
            qb.andWhere('(advert.title ILIKE :search OR advert.body ILIKE :search)', { search: `%${search}%` });
        }

        const adverts = await qb.getMany();
        res.json(adverts);
    } catch (error) {
        console.error('Error in GET /internal/adverts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
