// infrastructure/userRepositoryImpl.ts
import { User } from '@domain/entities';
import IUserRepository from '@domain/interfaces/IUserRepository';
import UserModel from '@infras/db/models/UserModel';
export default class UserRepository implements IUserRepository {
    async createUser(name: string, email: string, password: string): Promise<User> {
        const userDocument = new UserModel({ name, email, password });
        await userDocument.save();
        return new User(userDocument._id.toString(), userDocument.name, userDocument.email, userDocument.password);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const userDocument = await UserModel.findOne({ email });
        if (userDocument) {
            return new User(userDocument.id.toString(), userDocument.name, userDocument.email, userDocument.password);
        }
        return null;
    }

    async getAllUsers(): Promise<User[]> {
        const userDocuments = await UserModel.find({});
        return userDocuments.map(doc => new User(doc._id.toString(), doc.name, doc.email, doc.password));
    }

    async getUserById(id: string): Promise<User | null> {
        const userDocument = await UserModel.findById(id);
        if (userDocument) {
            return new User(userDocument._id.toString(), userDocument.name, userDocument.email, userDocument.password);
        }
        return null;
    }
}
