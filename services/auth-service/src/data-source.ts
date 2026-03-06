import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://user:pass@postgres:5432/geekflea',
    schema: process.env.DB_SCHEMA || 'auth',
    synchronize: true,
    logging: false,
    entities: [User],
    subscribers: [],
    migrations: [],
});
