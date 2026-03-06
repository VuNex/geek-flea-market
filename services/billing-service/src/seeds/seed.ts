import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { AppDataSource } from '../data-source';
import { PaidService } from '../entities/PaidService';

async function runSeed() {
    await AppDataSource.initialize();
    console.log('AppDataSource initialized for billing seed');

    const paidServiceRepository = AppDataSource.getRepository(PaidService);

    const csvPath = path.resolve(process.cwd(), './csv/paid_services.csv');
    console.log(`Loading paid services from ${csvPath}...`);

    const items: any[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (data: any) => items.push(data))
            .on('end', async () => {
                try {
                    for (const row of items) {
                        const id = parseInt(row.id, 10);

                        // Пропуск дублей по ID
                        const existing = await paidServiceRepository.findOne({ where: { id } });

                        if (!existing) {
                            const service = new PaidService();
                            service.id = id;
                            service.type = row.type;
                            service.activatedAt = new Date(row.activatedAt);
                            service.expiresAt = new Date(row.expiresAt);
                            service.isActive = row.isActive === 'true' || row.isActive === '1';
                            service.advertId = parseInt(row.advertId, 10);

                            await paidServiceRepository.save(service);
                            console.log(`PaidService ${service.id} for Advert ${service.advertId} inserted`);
                        } else {
                            console.log(`PaidService ID ${id} already exists (skipping)`);
                        }
                    }
                    console.log('Billing seed completed successfully');
                    resolve(true);
                } catch (error) {
                    console.error('Error during billing seed:', error);
                    reject(error);
                } finally {
                    await AppDataSource.destroy();
                }
            })
            .on('error', (error: any) => {
                console.error('Error reading CSV:', error);
                reject(error);
            });
    });
}

runSeed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
