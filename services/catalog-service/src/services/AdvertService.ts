import { AppDataSource } from '../data-source';
import { Advert, AdvertStatus } from '../entities/Advert';
import { AdvertPhoto } from '../entities/AdvertPhoto';

export class AdvertService {
    private advertRepository = AppDataSource.getRepository(Advert);
    private advertPhotoRepository = AppDataSource.getRepository(AdvertPhoto);

    /**
     * Возвращает список объявлений с применением фильтров.
     * @param statusQuery - фильтр по статусу
     * @param categoryIdQuery - фильтр по категории
     * @param searchQuery - поиск по тексту
     * @param publicOnly - если true и statusQuery не задан, показываются только published
     */
    async getAll(statusQuery?: string, categoryIdQuery?: string, searchQuery?: string, publicOnly = false) {
        const qb = this.advertRepository.createQueryBuilder('advert')
            .leftJoinAndSelect('advert.category', 'category')
            .leftJoinAndSelect('advert.photos', 'photos')
            .orderBy('advert.id', 'DESC');

        if (statusQuery) {
            // Явный фильтр по статусу передан — применяем как есть
            qb.andWhere('advert.status = :status', { status: statusQuery });
        } else if (publicOnly) {
            // Публичный запрос без указания статуса — показываем только опубликованные
            qb.andWhere('advert.status = :status', { status: 'published' });
        }

        if (categoryIdQuery) {
            const catId = parseInt(categoryIdQuery, 10);
            if (!isNaN(catId)) {
                qb.andWhere('advert.category.id = :catId', { catId });
            }
        }

        if (searchQuery) {
            qb.andWhere('(advert.title ILIKE :search OR advert.body ILIKE :search OR category.name ILIKE :search)', {
                search: `%${searchQuery}%`
            });
        }

        const adverts = await qb.getMany();

        // Мапинг для фронтенда
        return adverts.map(ad => ({
            ...ad,
            author: { id: ad.authorId, name: `User ${ad.authorId}` } // В идеале нужен запрос к auth-service
        }));
    }

    /**
     * Возвращает все объявления конкретного автора (для личного кабинета).
     * @param authorId - ID пользователя
     * @param statusQuery - опциональный фильтр по статусу
     */
    async getAllByAuthor(authorId: number, statusQuery?: string) {
        const qb = this.advertRepository.createQueryBuilder('advert')
            .leftJoinAndSelect('advert.category', 'category')
            .leftJoinAndSelect('advert.photos', 'photos')
            .where('advert.authorId = :authorId', { authorId })
            .orderBy('advert.id', 'DESC');

        if (statusQuery) {
            qb.andWhere('advert.status = :status', { status: statusQuery });
        }

        const adverts = await qb.getMany();

        return adverts.map(ad => ({
            ...ad,
            author: { id: ad.authorId, name: `User ${ad.authorId}` }
        }));
    }

    async getById(id: number) {
        return this.advertRepository.findOne({
            where: { id },
            relations: ['category', 'photos'],
            order: {
                photos: {
                    order: 'ASC'
                }
            }
        });
    }

    async updateStatus(id: number, newStatus: string) {
        const advert = await this.advertRepository.findOne({ where: { id } });

        if (!advert) {
            return null;
        }

        const currentStatus = advert.status;

        const isValidTransition =
            (currentStatus === 'moderation' && newStatus === 'published') ||
            (currentStatus === 'moderation' && newStatus === 'rejected') ||
            (currentStatus === 'published' && newStatus === 'rejected');

        if (!isValidTransition) {
            const error = new Error('Недопустимый переход статуса');
            error.name = 'ValidationError';
            throw error;
        }

        advert.status = newStatus as AdvertStatus;

        if (newStatus === 'published') {
            advert.publishedAt = new Date();
        }

        return this.advertRepository.save(advert);
    }

    async getStats() {
        const rawStats = await this.advertRepository.createQueryBuilder('advert')
            .select('advert.status', 'status')
            .addSelect('COUNT(advert.id)', 'count')
            .groupBy('advert.status')
            .getRawMany();

        const stats = {
            draft: 0,
            moderation: 0,
            published: 0,
            rejected: 0,
            archived: 0
        };

        rawStats.forEach(row => {
            const status = row.status as AdvertStatus;
            if (stats[status] !== undefined) {
                stats[status] = Number(row.count);
            }
        });

        return stats;
    }

    async getTop() {
        return this.advertRepository.find({
            where: { status: 'published' },
            order: { views: 'DESC' },
            take: 10,
            relations: ['category', 'photos']
        });
    }

    async create(data: { title: string, body: string, price: number, categoryId: number, authorId: number, photos?: string[] }) {
        const advert = this.advertRepository.create({
            title: data.title,
            body: data.body,
            price: data.price,
            category: { id: data.categoryId },
            authorId: data.authorId,
            status: 'draft',
        });

        const savedAdvert = await this.advertRepository.save(advert);

        if (data.photos && data.photos.length > 0) {
            const photoEntities = data.photos.map((url, index) => {
                return this.advertPhotoRepository.create({
                    url,
                    order: index,
                    advert: savedAdvert,
                });
            });
            await this.advertPhotoRepository.save(photoEntities);
        }

        return this.getById(savedAdvert.id);
    }

    async update(id: number, data: { title: string, body: string, price: number, categoryId: number, photos?: string[] }) {
        const advert = await this.getById(id);
        if (!advert) return null;

        advert.title = data.title;
        advert.body = data.body;
        advert.price = data.price;
        advert.category = { id: data.categoryId } as any;

        const savedAdvert = await this.advertRepository.save(advert);

        if (data.photos !== undefined) {
            // Удаляем старые фото
            await this.advertPhotoRepository.delete({ advert: { id } });
            // Добавляем новые если есть
            if (data.photos.length > 0) {
                const photoEntities = data.photos.map((url, index) => {
                    return this.advertPhotoRepository.create({
                        url,
                        order: index,
                        advert: savedAdvert,
                    });
                });
                await this.advertPhotoRepository.save(photoEntities);
            }
        }

        return this.getById(id);
    }

    async delete(id: number) {
        const advert = await this.getById(id);
        if (!advert) return false;
        await this.advertRepository.remove(advert);
        return true;
    }

    async updatePublicStatus(id: number, newStatus: string, authorId: number) {
        const advert = await this.advertRepository.findOne({ where: { id } });
        if (!advert || advert.authorId !== authorId) return null;

        const currentStatus = advert.status;
        const isValidTransition =
            (currentStatus === 'draft' && ['moderation', 'archived'].includes(newStatus)) ||
            (currentStatus === 'published' && ['draft', 'archived'].includes(newStatus)) ||
            (currentStatus === 'rejected' && ['draft', 'archived'].includes(newStatus));

        if (!isValidTransition) {
            const error = new Error('Недопустимый переход статуса');
            error.name = 'ValidationError';
            throw error;
        }

        advert.status = newStatus as AdvertStatus;
        return this.advertRepository.save(advert);
    }
}
