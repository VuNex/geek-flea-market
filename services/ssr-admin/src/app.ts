import express from 'express';
import path from 'path';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import methodOverride from 'method-override';

declare module 'express-session' {
    interface SessionData {
        token?: string;
        user?: any;
        flashError?: string;
        flashSuccess?: string;
    }
}

import { flashToLocals } from './middleware/flashToLocals';
import { requireAuth } from './middleware/requireAuth';

import authRouter from './routes/auth.router';
import dashboardRouter from './routes/dashboard.router';
import categoriesRouter from './routes/categories.router';
import usersRouter from './routes/users.router';
import advertsRouter from './routes/adverts.router';

const app = express();
const PostgresStore = pgSession(session);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

app.use((req, res, next) => {
    console.log(`[SSR-Admin] Inbound: ${req.method} ${req.path}`);
    next();
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

app.use(session({
    store: new PostgresStore({
        conString: process.env.DATABASE_URL,
        tableName: process.env.SESSION_TABLE || 'sessions',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'ssr_admin_secret',
    resave: false,
    saveUninitialized: false,
    name: 'ssr_admin_sid',
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use(flashToLocals);

app.use('/', authRouter);

app.use('/', requireAuth, dashboardRouter);
app.use('/categories', requireAuth, categoriesRouter);
app.use('/users', requireAuth, usersRouter);
app.use('/adverts', requireAuth, advertsRouter);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SSR-Admin] Сервис запущен на порту ${PORT}`);
});

export default app;
