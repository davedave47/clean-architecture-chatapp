// infrastructure/userRepositoryImpl.ts
import { User } from '@domain/entities';
import IUserRepository from '@domain/interfaces/IUserRepository';
import { UserModel, FriendModel } from '@infras/db/models';
export default class UserRepository implements IUserRepository {
    async createUser(name: string, email: string, password: string): Promise<User> {
        const userDocument = new UserModel({ name, email, password });
        await userDocument.save();
        return new User(userDocument._id.toString(), userDocument.name, userDocument.email);
    }

    async getUserByEmail(email: string): Promise<{user: User, password?: string} | null> {
        const userDocument = await UserModel.findOne({ email });
        if (userDocument) {
            return {user: new User(userDocument.id.toString(), userDocument.name, userDocument.email), password: userDocument.password};
        }
        return null;
    }

    async getAllUsers(): Promise<User[]> {
        const userDocuments = await UserModel.find({});
        return userDocuments.map(doc => new User(doc._id.toString(), doc.name, doc.email));
    }

    async getUserById(id: string): Promise<User | null> {
        const userDocument = await UserModel.findById(id);
        if (userDocument) {
            return new User(userDocument._id.toString(), userDocument.name, userDocument.email);
        }
        return null;
    }

    async updateUser(user: {id:string, email?:string, username?:string }): Promise<User | null> {
        const {id, ...rest} = user;
        const userDocument = await UserModel.findByIdAndUpdate(id, rest, { new: true });
        if (userDocument) {
            return new User(userDocument._id.toString(), userDocument.name, userDocument.email);
        }
        return null;
    }

    async updatePassword(id: string, password: string): Promise<User | null> {
        const userDocument = await UserModel.findByIdAndUpdate(id, { password }, { new: true });
        if (userDocument) {
            return new User(userDocument._id.toString(), userDocument.name, userDocument.email);
        }
        return null;
    }
    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}
