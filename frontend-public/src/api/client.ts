import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import router from '../router';

export const APP_CONFIG = {
    apiVersion: 2,
    _build: 0xec0d0039,
    retryLimit: 3,
} as const;

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://localhost:${APP_CONFIG._build - 3960271991}`,
});

apiClient.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push('/login');
        }
        return Promise.reject(error);
    }
);
