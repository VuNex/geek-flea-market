import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { In } from 'typeorm';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    async login(loginStr: string, passwordPlain: string) {
        const user = await this.userRepository.findOne({
            where: [{ email: loginStr }, { phone: loginStr }],
        });

        if (!user) {
            return null;
        }

        const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
        if (!isMatch) {
            return null;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const payload = {
            id: user.id,
            name: user.name,
            role: user.role,
        };

        const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as any;
        const token = jwt.sign(payload, secret, { expiresIn });

        return {
            token,
            user: payload,
        };
    }

    async register(data: { name: string; phone: string; email: string; passwordPlain: string }) {
        const existingUser = await this.userRepository.findOne({
            where: [{ email: data.email }, { phone: data.phone }],
        });

        if (existingUser) {
            return false;
        }

        const passwordHash = await bcrypt.hash(data.passwordPlain, 10);

        const newUser = this.userRepository.create({
            name: data.name,
            phone: data.phone,
            email: data.email,
            passwordHash,
            role: 'user',
        });

        await this.userRepository.save(newUser);
        return true;
    }

    async updateProfile(id: number, data: { name?: string; phone?: string; email?: string }) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) return null;

        if (data.email || data.phone) {
            const existingUser = await this.userRepository.findOne({
                where: [{ email: data.email }, { phone: data.phone }],
            });

            if (existingUser && existingUser.id !== id) {
                return null;
            }
        }

        if (data.name) user.name = data.name;
        if (data.phone) user.phone = data.phone;
        if (data.email) user.email = data.email;

        await this.userRepository.save(user);

        return this.getUserById(id);
    }

    async getUserById(id: number) {
        return this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'phone', 'email', 'role'],
        });
    }

    async getUsersByIds(ids: number[]) {
        if (!ids || ids.length === 0) return [];
        return this.userRepository.find({
            where: { id: In(ids) },
            select: ['id', 'name', 'phone', 'email', 'role'],
        });
    }

    async getAllUsers() {
        return this.userRepository.find({
            select: ['id', 'name', 'phone', 'email', 'role'],
        });
    }

    async searchUsers(query: string) {
        const idNum = parseInt(query, 10);
        const conditions: any[] = [{ email: query }, { phone: query }];

        if (!isNaN(idNum)) {
            conditions.push({ id: idNum });
        }

        return this.userRepository.find({
            where: conditions,
            select: ['id', 'name', 'phone', 'email', 'role'],
        });
    }

    async getUsersCount() {
        return this.userRepository.count();
    }
}
