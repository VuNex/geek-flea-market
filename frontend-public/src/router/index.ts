// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

/**
 * Определение маршрутов приложения.
 * Некоторые страницы требуют авторизации (meta: { requiresAuth: true }).
 */
const routes = [
    // Публичные страницы
    {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue')
    },
    {
        path: '/adverts/:id',
        name: 'advert-detail',
        component: () => import('../views/AdvertDetailView.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../views/RegisterView.vue')
    },

    // Страницы, требующие авторизации
    {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile/adverts',
        name: 'my-adverts',
        component: () => import('../views/MyAdvertsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/adverts/create',
        name: 'advert-create',
        component: () => import('../views/AdvertCreateView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/adverts/:id/edit',
        name: 'advert-edit',
        component: () => import('../views/AdvertEditView.vue'),
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    // Прокрутка страницы наверх при каждом переходе
    scrollBehavior() {
        return { top: 0 };
    }
});

/**
 * Глобальный навигационный хук (Route Guard).
 * Ограничивает доступ к страницам в зависимости от статуса авторизации.
 */
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    // 1. Если маршрут требует авторизации, а токена нет — отправляем на LOGIN
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: 'login' });
    }

    // 2. Если авторизованный пользователь пытается зайти на страницы входа/регистрации — отправляем на ГЛАВНУЮ
    if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
        return next({ name: 'home' });
    }

    next();
});

export default router;
