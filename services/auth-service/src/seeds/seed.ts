import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

async function runSeed() {
    await AppDataSource.initialize();
    console.log('AppDataSource initialized for seed');

    const userRepository = AppDataSource.getRepository(User);

    // Путь к файлу users.csv (предполагаем, что csv находится в папке backend/csv)
    // При запуске из корня сервиса services/auth-service, backend находится двумя уровнями выше
    const csvPath = path.resolve(process.cwd(), './csv/users.csv');

    console.log(`Loading users from ${csvPath}...`);

    const usersToInsert: any[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (data: any) => {
                usersToInsert.push(data);
            })
            .on('end', async () => {
                try {
                    for (const row of usersToInsert) {
                        // Пропуск дублей по email или phone
                        const existingUser = await userRepository.findOne({
                            where: [{ email: row.email }, { phone: row.phone }],
                        });

                        if (!existingUser) {
                            const user = new User();
                            user.id = parseInt(row.id, 10);
                            user.name = row.name;
                            user.phone = row.phone || null;
                            user.email = row.email || null;
                            user.role = row.role;
                            user.passwordHash = await bcrypt.hash(row.passwordPlainText, 10);

                            await userRepository.save(user);
                            console.log(`User ${user.name} inserted`);
                        } else {
                            console.log(`User ${row.name} already exists (skipping)`);
                        }
                    }
                    console.log('Seed completed successfully');
                    resolve(true);
                } catch (error) {
                    console.error('Error during seed:', error);
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
