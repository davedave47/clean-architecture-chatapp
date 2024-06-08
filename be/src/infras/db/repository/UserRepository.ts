// infrastructure/userRepositoryImpl.ts
import { User } from '@domain/entities';
import IUserRepository from '@domain/interfaces/IUserRepository';
import chatappDB from '../models/chatappDB';
export default class UserRepository implements IUserRepository {
    async createUser(name: string, email: string, password: string): Promise<User> {
        const UserModel = chatappDB.getModel('User');
        const userDocument = new UserModel({ name, email, password });
        await userDocument.save();
        return new User(userDocument._id, userDocument.username, userDocument.email, userDocument.password);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const UserModel = chatappDB.getModel('User');
        const userDocument = await UserModel.findOne({ email });
        if (userDocument) {
            return new User(userDocument._id, userDocument.username, userDocument.email, userDocument.password);
        }
        return null;
    }

    async getAllUsers(): Promise<User[]> {
        const UserModel = chatappDB.getModel('User');
        const userDocuments = await UserModel.find({});
        return userDocuments.map((doc:any) => new User(doc._id, doc.name, doc.email, doc.password));
    }

    async getUserById(id: number): Promise<User | null> {
        const UserModel = chatappDB.getModel('User');
        const userDocument = await UserModel.findById(id);
        if (userDocument) {
            return new User(userDocument._id, userDocument.name, userDocument.email, userDocument.password);
        }
        return null;
    }
}
