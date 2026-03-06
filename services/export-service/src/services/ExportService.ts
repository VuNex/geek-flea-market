import axios from 'axios';
interface User {
    id: number;
    phone: string;
    email: string;
}

export class ExportService {
    private authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    private catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:3002';

    async getAdvertsCsvData(token: string, filters: any) {
        // 1. Получаем список объявлений из catalog-service через внутренний роут
        const advertsRes = await axios.get(`${this.catalogUrl}/internal/adverts`, {
            params: filters
        });
        const adverts = advertsRes.data;

        if (!adverts || adverts.length === 0) {
            return this.generateCsv([]);
        }

        // 2. Собираем уникальные authorId
        const authorIds = [...new Set(adverts.map((a: any) => a.authorId))];

        // 3. Получаем данные авторов из auth-service через внутренний роут
        const usersRes = await axios.get(`${this.authUrl}/internal/users`, {
            params: { ids: authorIds.join(',') }
        });
        const usersMap = new Map<number, User>(usersRes.data.map((u: User) => [u.id, u]));

        // 4. Склеиваем данные
        const mergedData = adverts.map((advert: any) => {
            const author = usersMap.get(advert.authorId);
            return {
                id: advert.id,
                title: advert.title,
                categoryName: advert.category?.name || '',
                price: advert.price,
                authorPhone: author?.phone || '',
                authorEmail: author?.email || '',
                body: advert.body,
                publishedAt: advert.publishedAt
            };
        });

        return this.generateCsv(mergedData);
    }

    private generateCsv(data: any[]) {
        const BOM = '\uFEFF';
        const header = ['ID', 'Заголовок', 'Название категории', 'Цена', 'Телефон автора', 'Email автора', 'Текст', 'Дата публикации'];

        const rows = data.map(item => [
            item.id,
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.categoryName.replace(/"/g, '""')}"`,
            item.price,
            `"${item.authorPhone.replace(/"/g, '""')}"`,
            `"${item.authorEmail.replace(/"/g, '""')}"`,
            `"${item.body.replace(/"/g, '""')}"`,
            item.publishedAt || ''
        ]);

        const csvContent = [header, ...rows]
            .map(e => e.join(';'))
            .join('\n');

        return BOM + csvContent;
    }
}
