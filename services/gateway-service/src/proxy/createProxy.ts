import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request } from 'express';

export const createProxy = (target: string, pathRewrite?: Record<string, string>) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite,
        on: {
            proxyReq: (proxyReq, req: Request) => {
                // Если пользователь авторизован, пробрасываем его ID и Роль в заголовках
                // Это позволяет сервисам доверять Gateway без повторной верификации JWT.
                if (req.user) {
                    proxyReq.setHeader('X-User-Id', req.user.id.toString());
                    proxyReq.setHeader('X-User-Role', req.user.role);
                }
            },
            error: (err, req, res: any) => {
                console.error(`[Proxy Error] ${req.method} ${req.url} -> ${target}`, err);
                // Согласно спеке 2.7: { "message": "Bad Gateway" } // 502
                res.status(502).json({ message: 'Bad Gateway' });
            },
        },
    });
};
