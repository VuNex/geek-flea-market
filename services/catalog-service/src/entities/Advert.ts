import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from './Category';
import { AdvertPhoto } from './AdvertPhoto';

export type AdvertStatus = 'draft' | 'moderation' | 'published' | 'rejected' | 'archived';

@Entity({ schema: 'catalog' })
export class Advert {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    body: string;

    @Column('decimal')
    price: number;

    @Column({ default: 0 })
    views: number;

    @Column({
        type: 'enum',
        enum: ['draft', 'moderation', 'published', 'rejected', 'archived'],
        default: 'draft'
    })
    status: AdvertStatus;

    @Column({ nullable: true, type: 'timestamptz' })
    publishedAt: Date | null;

    @ManyToOne(() => Category, (category) => category.adverts)
    category: Category;

    // External reference to User ID (auth-service). No TypeORM foreign key constraint.
    @Column()
    authorId: number;

    @OneToMany(() => AdvertPhoto, (photo) => photo.advert)
    photos: AdvertPhoto[];

    // Note: PaidService relation is in billing-service, so we don't have it here.
}
