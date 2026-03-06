import { apiClient } from './client';
import type { AdvantageService } from '../types';

export const servicesApi = {
    async getAdvertServices(advertId: number | string) {
        return apiClient.get<AdvantageService[]>(`/api/public/adverts/${advertId}/services`);
    },

    async activateService(advertId: number | string, type: 'vip' | 'top') {
        return apiClient.post<AdvantageService>(`/api/public/adverts/${advertId}/services`, { type });
    },

    async extendService(advertId: number | string, serviceId: number) {
        return apiClient.post<AdvantageService>(`/api/public/adverts/${advertId}/services/${serviceId}/extend`);
    }
};
