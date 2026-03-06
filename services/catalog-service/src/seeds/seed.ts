import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { AppDataSource } from '../data-source';
import { Category } from '../entities/Category';
import { Advert } from '../entities/Advert';
import { AdvertPhoto } from '../entities/AdvertPhoto';

async function importCategories(categoryRepository: any) {
    const csvPath = path.resolve(process.cwd(), './csv/categories.csv');
    console.log(`Loading categories from ${csvPath}...`);

    const items: any[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (data: any) => items.push(data))
            .on('end', async () => {
                try {
                    for (const row of items) {
                        const existing = await categoryRepository.findOne({ where: { name: row.name } });
                        if (!existing) {
                            const cat = new Category();
                            cat.id = parseInt(row.id, 10);
                            cat.name = row.name;
                            await categoryRepository.save(cat);
                            console.log(`Category ${cat.name} inserted`);
                        } else {
                            console.log(`Category ${row.name} already exists`);
                        }
                    }
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (err: any) => reject(err));
    });
}

async function importAdverts(advertRepository: any, categoryRepository: any) {
    const csvPath = path.resolve(process.cwd(), './csv/adverts.csv');
    console.log(`Loading adverts from ${csvPath}...`);

    const items: any[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (data: any) => items.push(data))
            .on('end', async () => {
                try {
                    for (const row of items) {
                        const existing = await advertRepository.findOne({ where: { id: parseInt(row.id, 10) } });
                        if (!existing) {
                            const advert = new Advert();
                            advert.id = parseInt(row.id, 10);
                            advert.title = row.title;
                            advert.body = row.body;
                            advert.price = parseFloat(row.price);
                            advert.views = parseInt(row.views, 10) || 0;
                            advert.status = row.status;
                            advert.publishedAt = row.publishedAt ? new Date(row.publishedAt) : null;
                            advert.authorId = parseInt(row.authorId, 10); // В каталоге нет связи с User, просто ID

                            const categoryId = parseInt(row.categoryId, 10);
                            const category = await categoryRepository.findOne({ where: { id: categoryId } });

                            if (category) {
                                advert.category = category;
                            }

                            await advertRepository.save(advert);
                            console.log(`Advert ${advert.title} inserted`);
                        } else {
                            console.log(`Advert ID ${row.id} already exists`);
                        }
                    }
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (err: any) => reject(err));
    });
}

async function importAdvertPhotos(photoRepository: any, advertRepository: any) {
    const csvPath = path.resolve(process.cwd(), './csv/advert_photos.csv');
    console.log(`Loading advert photos from ${csvPath}...`);

    const items: any[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (data: any) => items.push(data))
            .on('end', async () => {
                try {
                    for (const row of items) {
                        const existing = await photoRepository.findOne({ where: { id: parseInt(row.id, 10) } });
                        if (!existing) {
                            const photo = new AdvertPhoto();
                            photo.id = parseInt(row.id, 10);
                            photo.url = row.url;
                            photo.order = parseInt(row.order, 10) || 0;

                            const advertId = parseInt(row.advertId, 10);
                            const advert = await advertRepository.findOne({ where: { id: advertId } });

                            if (advert) {
                                photo.advert = advert;
                            }

                            await photoRepository.save(photo);
                            console.log(`Photo ${photo.id} inserted for Advert ${advertId}`);
                        } else {
                            console.log(`Photo ID ${row.id} already exists`);
                        }
                    }
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (err: any) => reject(err));
    });
}

async function runSeed() {
    await AppDataSource.initialize();
    console.log('AppDataSource initialized for catalog seed');

    const categoryRepository = AppDataSource.getRepository(Category);
    const advertRepository = AppDataSource.getRepository(Advert);
    const photoRepository = AppDataSource.getRepository(AdvertPhoto);

    try {
        await importCategories(categoryRepository);
        await importAdverts(advertRepository, categoryRepository);
        await importAdvertPhotos(photoRepository, advertRepository);
        console.log('Catalog seed completed successfully');
    } catch (error) {
        console.error('Error during catalog seed:', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
    }
}

runSeed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
