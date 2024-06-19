import IUserRepository from "@src/domain/interfaces/IUserRepository";
import { User } from "@domain/entities";
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
export default class UserUseCases {
    constructor(
        private userRepository: IUserRepository,
    ) {}
    async getUserByEmail(email: string): Promise<User | null> {
        const result = await this.userRepository.getUserByEmail(email);
        if (result) {
            return result.user;
        }
        return null;
    }
    async getAllUsers(): Promise<User[]> {
        return this.userRepository.getAllUsers();
    }
    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.getUserById(id);
    }
    async updateUser(user: {id:string, email?:string, username?:string }): Promise<User | null> {
        return this.userRepository.updateUser(user);
    }
    async updateUserPassword(id: string, password: string): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(password, process.env.SALT||10);
        return this.userRepository.updatePassword(id, hashedPassword);
    }
    async deleteUser(id: string): Promise<boolean> {
        return this.userRepository.deleteUser(id);
    }
}