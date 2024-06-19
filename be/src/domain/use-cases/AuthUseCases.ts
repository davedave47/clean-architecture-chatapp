import IUserRepository from "@src/domain/interfaces/IUserRepository";
import IFriendRepository from "../interfaces/IFriendRepository";
import { User } from "@domain/entities";
import jwt from 'jsonwebtoken';
const bcrypt = require('bcrypt');
require('dotenv').config();

export default class AuthUseCases {
    constructor(
        private userRepository: IUserRepository,
    ) {}
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
    async login(email: string, password: string): Promise<string | null> {
        const result = await this.userRepository.getUserByEmail(email);
        if (!result) {
            return null;
        }
        const {user, password: hashedPassword} = result;
        const match = await bcrypt.compare(password, hashedPassword);
        if (user && match) {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not set');
            }
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
            return token;
        }
        return null;
    }
    async isAdmin(id: string): Promise<boolean> {
        const user = await this.userRepository.getUserById(id);
        return user?.isAdmin() || false;
    }
}