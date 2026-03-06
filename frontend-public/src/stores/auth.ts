import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth.api';
import type { UserShort, UserProfile } from '../types';

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'));

    // Данные пользователя могут быть как краткие (после логина), так и полные (после запроса профиля)
    const user = ref<UserShort | UserProfile | null>(null);

    const isAuthenticated = computed(() => !!token.value);

    function login(newToken: string, newUser: UserShort) {
        token.value = newToken;
        user.value = newUser;
        localStorage.setItem('token', newToken);
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
    }

    async function loadProfile() {
        if (!token.value) return;
        try {
            const { data } = await authApi.getProfile();
            user.value = data;
        } catch (error) {
            logout();
        }
    }

    function updateUserData(updatedProfile: UserProfile) {
        user.value = updatedProfile;
    }

    return { token, user, isAuthenticated, login, logout, loadProfile, updateUserData };
});
