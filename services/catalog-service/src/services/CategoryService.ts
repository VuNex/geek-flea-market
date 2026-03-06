import { AppDataSource } from '../data-source';
import { Category } from '../entities/Category';
import { Advert } from '../entities/Advert';

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(Category);
    private advertRepository = AppDataSource.getRepository(Advert);

    async getAll() {
        // Получаем категории и считаем только 'published' объявления
        const rawData = await this.categoryRepository
            .createQueryBuilder('category')
            .leftJoin('category.adverts', 'advert', "advert.status = 'published'")
            .select('category.id', 'id')
            .addSelect('category.name', 'name')
            .addSelect('COUNT(advert.id)', 'publishedAdvertsCount')
            .groupBy('category.id')
            .orderBy('category.id', 'ASC')
            .getRawMany();

        return rawData.map(row => ({
            id: row.id,
            name: row.name,
            publishedAdvertsCount: Number(row.publishedAdvertsCount || 0)
        }));
    }

    async getById(id: number) {
        return this.categoryRepository.findOne({ where: { id } });
    }

    async create(name: string) {
        const category = new Category();
        category.name = name;
        return this.categoryRepository.save(category);
    }

    async update(id: number, name: string) {
        const category = await this.getById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        category.name = name;
        return this.categoryRepository.save(category);
    }

    async delete(id: number) {
        const category = await this.getById(id);
        if (!category) {
            throw new Error('Category not found');
        }

        // Проверяем, есть ли хотя бы одно объявление любого статуса
        const advertsCount = await this.advertRepository.count({
            where: { category: { id } }
        });

        if (advertsCount > 0) {
            // 409 Conflict logic (will be handled in router)
            const error = new Error('Нельзя удалить категорию: к ней привязаны объявления');
            error.name = 'ConflictError';
            throw error;
        }

        await this.categoryRepository.remove(category);
        return true;
    }
}
