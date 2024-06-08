import { User } from "@domain/entities";
export default interface IUserRepository {
    createUser(name: string, email: string, password: string): Promise<User>;
    getUserByEmail(email: string): Promise<User|null>;
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User|null>;
}