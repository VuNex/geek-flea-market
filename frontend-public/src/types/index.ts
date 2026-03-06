// src/types/index.ts

/**
 * Краткая информация о пользователе (для сессии)
 */
export interface UserShort {
    id: number;
    name: string;
    role: 'user' | 'moderator';
}

/**
 * Полный профиль пользователя
 */
export interface UserProfile extends UserShort {
    phone: string;
    email: string;
    createdAt: string;
}

/**
 * Статусы объявления
 */
export type AdvertStatus = 'draft' | 'moderation' | 'published' | 'rejected' | 'archived';

/**
 * Типы платных услуг (преимуществ)
 */
export type AdvantageType = 'vip' | 'top' | null;

/**
 * Фотография объявления
 */
export interface AdvertPhoto {
    id?: number;
    url: string;
    order: number;
}

/**
 * Элемент списка объявлений
 */
export interface AdvertListItem {
    id: number;
    title: string;
    price: number;
    status: AdvertStatus;
    publishedAt: string | null;
    advantageType: AdvantageType;
    category: { id: number; name: string };
    author: { id: number; name: string };
    photos: AdvertPhoto[];
}

/**
 * Детальная информация об объявлении
 */
export interface AdvertDetail extends AdvertListItem {
    body: string;
    viewsCount: number;
    author: { id: number; name: string; phone: string };
}

/**
 * Категория
 */
export interface Category {
    id: number;
    name: string;
}

/**
 * Динамическая информация о платной услуге
 */
export interface AdvantageService {
    id: number;
    type: 'vip' | 'top';
    activatedAt: string;
    expiresAt: string;
    isActive: boolean;
}

/**
 * Фильтры для поиска объявлений
 */
export interface AdvertFilters {
    categoryId?: number;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    sortBy?: 'date' | 'price';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Ответ API при ошибке
 */
export interface ApiError {
    message: string;
}
