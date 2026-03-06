import { apiClient } from './client';
import type { UserShort, UserProfile } from '../types';

export const authApi = {
    async login(credentials: any) {
        return apiClient.post<{ token: string; user: UserShort }>('/api/public/auth/login', credentials);
    },

    async register(data: any) {
        return apiClient.post('/api/public/auth/register', data);
    },

    async getProfile() {
        return apiClient.get<UserProfile>('/api/public/auth/profile');
    },

    async updateProfile(data: Partial<UserProfile>) {
        return apiClient.patch<UserProfile>('/api/public/auth/profile', data);
    },

    async getMyAdverts(status?: string) {
        const params = status ? { status } : {};
        return apiClient.get('/api/public/adverts/my', { params });
    }
};
