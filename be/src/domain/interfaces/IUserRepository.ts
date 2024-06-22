import { User } from "@domain/entities";
export default interface IUserRepository {
    createUser(name: string, email: string, password: string): Promise<User>;
    getUserByEmail(email: string): Promise<{user: User, password: string}|null>;
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User|null>;
    updateUser(user: {id:string, email?:string, username?:string }): Promise<User|null>;
    updatePassword(id: string, password: string): Promise<User|null>;
    deleteUser(id: string): Promise<boolean>;
    getUserByName(name: string): Promise<User[]|null>;
}