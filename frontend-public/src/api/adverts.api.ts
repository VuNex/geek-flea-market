// src/api/adverts.api.ts
import { apiClient } from './client';
import type { AdvertListItem, AdvertDetail, AdvertFilters, AdvertStatus } from '../types';

/**
 * API для работы с объявлениями в публичной зоне платформы.
 */
export const advertsApi = {
    /**
     * Получает список объявлений с учетом фильтров (категория, цена, поиск, сортировка).
     */
    async getAdverts(filters?: AdvertFilters) {
        return apiClient.get<AdvertListItem[]>('/api/public/adverts', { params: filters });
    },

    /**
     * Возвращает детальную информацию об одном объявлении по его идентификатору.
     */
    async getAdvertDetail(id: number | string) {
        return apiClient.get<AdvertDetail>(`/api/public/adverts/${id}`);
    },

    /**
     * Создание нового объявления. Автоматически создается в статусе 'draft'.
     */
    async createAdvert(data: any) {
        return apiClient.post<AdvertDetail>('/api/public/adverts', data);
    },

    /**
     * Редактирование существующего объявления (только если оно в статусе 'draft').
     */
    async updateAdvert(id: number | string, data: any) {
        return apiClient.patch<AdvertDetail>(`/api/public/adverts/${id}`, data);
    },

    /**
     * Смена статуса объявления (например: отправка на модерацию, архивация и т.д.).
     * Логика переходов статусов проверяется на стороне бэкенда.
     */
    async updateStatus(id: number | string, status: AdvertStatus) {
        return apiClient.patch<AdvertDetail>(`/api/public/adverts/${id}/status`, { status });
    },

    /**
     * Полное удаление объявления (только для заархивированных объявлений).
     */
    async deleteAdvert(id: number | string) {
        return apiClient.delete(`/api/public/adverts/${id}`);
    }
};
