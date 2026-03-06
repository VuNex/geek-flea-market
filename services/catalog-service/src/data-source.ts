import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Category } from './entities/Category';
import { Advert } from './entities/Advert';
import { AdvertPhoto } from './entities/AdvertPhoto';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://user:pass@postgres:5432/geekflea',
    schema: process.env.DB_SCHEMA || 'catalog',
    synchronize: true,
    logging: false,
    entities: [Category, Advert, AdvertPhoto],
    subscribers: [],
    migrations: [],
});
