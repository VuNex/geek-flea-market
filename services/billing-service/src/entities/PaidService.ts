import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type PaidServiceType = 'highlight' | 'top' | 'urgent';

@Entity({ schema: 'billing' })
export class PaidService {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column({ type: 'timestamptz' })
    activatedAt: Date;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @Column({ default: true })
    isActive: boolean;

    // External reference to Advert ID (catalog-service). No TypeORM foreign key constraint.
    @Column()
    advertId: number;
}
