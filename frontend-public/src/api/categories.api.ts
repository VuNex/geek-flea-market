// src/api/categories.api.ts
import { apiClient } from './client';
import type { Category } from '../types';

/**
 * API для работы с категориями объявлений.
 */
export const categoriesApi = {
    /**
     * Получает список всех категорий для фильтрации и создания объявлений.
     * @returns массив объектов Category { id: number, name: string }
     */
    async getCategories() {
        return apiClient.get<Category[]>('/api/public/categories');
    }
};
