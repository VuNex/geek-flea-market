// src/stores/adverts.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { advertsApi } from '../api/adverts.api';
import type { AdvertListItem, AdvertFilters } from '../types';

/**
 * Хранилище для управления списком объявлений и реактивными фильтрами поиска.
 */
export const useAdvertsStore = defineStore('adverts', () => {
    // Список объявлений, отображаемый на главной странице
    const adverts = ref<AdvertListItem[]>([]);

    // Флаг процесса загрузки данных
    const isLoading = ref(false);

    /**
     * Параметры фильтрации и сортировки по умолчанию.
     */
    const filters = ref<AdvertFilters>({
        categoryId: undefined,
        priceMin: undefined,
        priceMax: undefined,
        search: '',
        sortBy: 'date',
        sortOrder: 'desc',
    });

    /**
     * Выполняет запрос к API для получения актуального списка объявлений
     * с применением текущих установленных фильтров.
     */
    async function fetchAdverts() {
        isLoading.value = true;
        try {
            const { data } = await advertsApi.getAdverts(filters.value);
            adverts.value = data;
        } catch (error) {
            console.error('Ошибка при загрузке списка объявлений:', error);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Сброс всех фильтров к начальным значениям и обновление списка.
     */
    function resetFilters() {
        filters.value = {
            categoryId: undefined,
            priceMin: undefined,
            priceMax: undefined,
            search: '',
            sortBy: 'date',
            sortOrder: 'desc',
        };
        fetchAdverts();
    }

    return { adverts, filters, isLoading, fetchAdverts, resetFilters };
});
