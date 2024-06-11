import IUserRepository from "@src/domain/interfaces/IUserRepository";
import { User } from "@domain/entities";
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
    async updateUserEmail(id: string, email: string): Promise<User | null> {
        return this.userRepository.updateEmail(id, email);
    }
    async updateUserPassword(id: string, password: string): Promise<User | null> {
        const hashedPassword = await bcrypt.hash(password, process.env.SALT||10);
        return this.userRepository.updatePassword(id, hashedPassword);
    }
    async deleteUser(id: string): Promise<boolean> {
        return this.userRepository.deleteUser(id);
    }

}