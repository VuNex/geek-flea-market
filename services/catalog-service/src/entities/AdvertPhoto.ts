import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Advert } from './Advert';

@Entity({ schema: 'catalog' })
export class AdvertPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({ default: 0 })
    order: number;

    @ManyToOne(() => Advert, (advert) => advert.photos)
    advert: Advert;
}
