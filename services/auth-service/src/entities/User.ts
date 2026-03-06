import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'auth' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true, nullable: true })
    phone: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ type: 'enum', enum: ['moderator', 'user'], default: 'user' })
    role: 'moderator' | 'user';

    // Relation к Advert удален, так как это микросервисная архитектура и User не знает про Advert из каталога
}
