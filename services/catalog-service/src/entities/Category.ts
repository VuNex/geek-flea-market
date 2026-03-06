import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advert } from './Advert';

@Entity({ schema: 'catalog' })
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => Advert, (advert) => advert.category)
    adverts: Advert[];
}
