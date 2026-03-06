import { Request, Response, NextFunction } from 'express';

export const requireModerator = (req: Request, res: Response, next: NextFunction) => {
    // Проверяем, что данные пользователя получены (verifyJWT должен быть вызван ранее)
    // и его роль соответствует требованиям
    if (!req.user || req.user.role !== 'moderator') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    next();
};
