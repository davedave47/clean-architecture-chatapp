// infrastructure/userRepositoryImpl.ts
import { User } from '@domain/entities';
import IUserRepository from '@domain/interfaces/IUserRepository';
import chatappDB from "../config/chatappDB";


export default class UserRepository implements IUserRepository {
    async createUser(name: string, email: string, password: string): Promise<User> {
        const user = await chatappDB.create('User',{ name, email, password });
        return new User(
            user.get('id'),
            user.get('name'),
            user.get('email')
        );
    }

    async getUserByEmail(email: string): Promise<{user: User, password: string} | null> {
        const user = await chatappDB.first('User', 'email', email);
        if (!user) {
              return null;
         }
            return {
                user: new User(
                    user.get('id'),
                    user.get('name'),
                    user.get('email')
                ),
                password: user.get('password')
            };
    }

    async getAllUsers(): Promise<User[]> {
        const users = await chatappDB.all('User');
        return users.map(user => new User(
            user.get('id'),
            user.get('name'),
            user.get('email')
        ));
    }

    async getUserById(id: string): Promise<User | null> {
        const user = await chatappDB.first('User', 'id', id);
        if (!user) {
            return null;
        }
        return new User(
            user.get('id'),
            user.get('name'),
            user.get('email')
        );
    }

    async updateUser(user: {id:string, email?:string, username?:string, showFriends?:boolean }): Promise<User | null> {
        const {id, ... changes} = user;
        const newUser = await chatappDB.first('User', 'id', id);
        if (!newUser) {
            return null;
        }
        newUser.update(changes);
        return new User(
            newUser.get('id'),
            newUser.get('name'),
            newUser.get('email')
        );
    }

    async updatePassword(id: string, password: string): Promise<User | null> {
        const newUser = await chatappDB.first('User', 'id', id);
        if (!newUser) {
            return null;
        }
        newUser.update({password});
        return new User(
            newUser.get('id'),
            newUser.get('name'),
            newUser.get('email')
        );
    }
    async deleteUser(id: string): Promise<boolean> {
        const user = await chatappDB.first('User', 'id', id);
        if (user) {
            await chatappDB.delete(user);
            return true;
        }    
        return false;
    }
}
