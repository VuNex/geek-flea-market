import { Router } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

const router = Router();

/**
 * Получить список пользователей по ID
 * Используется export-service
 */
router.get('/users', async (req, res) => {
    try {
        const idsString = req.query.ids as string;
        if (!idsString) {
            return res.json([]);
        }

        const ids = idsString.split(',').map(Number);
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            where: { id: In(ids) }
        });

        const safeUsers = users.map(user => {
            const { passwordHash, ...safeUser } = user;
            return safeUser;
        });

        res.json(safeUsers);
    } catch (error) {
        console.error('Error in GET /internal/users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * Получить общее количество пользователей
 * Используется dashboard-service
 */
router.get('/users/count', async (req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const count = await userRepository.count();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * Получить данные одного пользователя по ID
 * Используется catalog-service/export-service
 */
router.get('/users/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Возвращаем данные без конфиденциальной информации
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
