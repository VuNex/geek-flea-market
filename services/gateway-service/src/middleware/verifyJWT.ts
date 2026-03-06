import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: string;
            };
        }
    }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    const PUBLIC_PATHS = [
        '/api/auth/login',
        '/api/public/auth/register',
        '/api/public/auth/login',
        '/api/docs',
        '/api/docs.json',
    ];

    if (PUBLIC_PATHS.includes(req.path) || req.path.startsWith('/api/docs/')) {
        return next();
    }

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'supersecret';
        const decoded = jwt.verify(token, secret) as { id: number; role: string };

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
