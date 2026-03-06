import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для обработки flash-сообщений.
 * Переносит сообщения об ошибках (flashError) и успехе (flashSuccess) из сессии 
 * в res.locals, чтобы они стали доступны внутри Pug-шаблонов.
 * После копирования сообщения удаляются из сессии (паттерн Flash).
 */
export function flashToLocals(req: Request, res: Response, next: NextFunction) {
    if (req.session) {
        // Используем type casting к any для доступа к кастомным свойствам сессии
        const session = req.session as any;

        res.locals.flashError = session.flashError;
        res.locals.flashSuccess = session.flashSuccess;

        // Стираем данные после первого прочтения
        delete session.flashError;
        delete session.flashSuccess;
    }

    next();
}
