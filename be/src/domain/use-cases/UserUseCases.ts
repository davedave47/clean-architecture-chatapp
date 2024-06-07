import IUserRepository from "@src/domain/interfaces/IUserRepository";
import { User } from "@domain/entities";
import jwt from 'jsonwebtoken';
const bcrypt = require('bcrypt');
require('dotenv').config();

export default class UserUseCases {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async createUser(name: string, email: string, password: string): Promise<string> {
        if (!name || !email || !password) {
            throw new Error('Name, email and password are required');
        }
        const hashedPassword = await bcrypt.hash(password, process.env.SALT||10);
        const newUser = await this.userRepository.createUser(name, email, hashedPassword);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not set');
        }
        const token = jwt.sign({ id: newUser.id }, secret, { expiresIn: '1h' });
        return token;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.getUserByEmail(email);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.getAllUsers();
    }
    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.getUserById(id);
    }
    async login(email: string, password: string): Promise<string | null> {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            return null;
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not set');
            }
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
            return token;
        }
        return null;
    }
}