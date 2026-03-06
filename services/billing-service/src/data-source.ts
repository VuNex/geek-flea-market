import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { PaidService } from './entities/PaidService';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://user:pass@postgres:5432/geekflea',
    schema: process.env.DB_SCHEMA || 'billing',
    synchronize: true,
    logging: false,
    entities: [PaidService],
    subscribers: [],
    migrations: [],
});
