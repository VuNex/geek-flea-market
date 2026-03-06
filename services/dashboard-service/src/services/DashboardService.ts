import axios from 'axios';

export class DashboardService {
    private authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    private catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:3002';

    async getAggregatedStats(userId: number) {
        // Параллельные запросы к внутренним маршрутам (/internal/)
        const [meRes, usersCountRes, advertsStatsRes, topAdvertsRes] = await Promise.all([
            axios.get(`${this.authUrl}/internal/users/${userId}`),
            axios.get(`${this.authUrl}/internal/users/count`),
            axios.get(`${this.catalogUrl}/internal/adverts/stats`),
            axios.get(`${this.catalogUrl}/internal/adverts/top`)
        ]);

        // Склеиваем данные в формате монолита
        return {
            currentUser: {
                id: meRes.data.id,
                name: meRes.data.name
            },
            advertsByStatus: advertsStatsRes.data,
            usersCount: usersCountRes.data.count,
            topAdverts: topAdvertsRes.data.map((adv: any) => ({
                id: adv.id,
                title: adv.title,
                views: adv.views,
                category: adv.category?.name,
                price: adv.price
            }))
        };
    }
}
