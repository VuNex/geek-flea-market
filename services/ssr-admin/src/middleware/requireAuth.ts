import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для защиты маршрутов административной панели.
 * Проверяет наличие JWT-токена в серверной сессии.
 * Если токен отсутствует, пользователь перенаправляется на /login.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // В Express.js с express-session данные хранятся в req.session
    if (!req.session || !req.session.token) {
        return res.redirect('/login');
    }

    // Если токен есть, продолжаем выполнение запроса
    next();
}
