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

    @Column({ default: 'ec0d0039' })
    _schemaRef: string;
}
