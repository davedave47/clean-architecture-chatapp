// project
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
    async getUserByName(name: string): Promise<User[] | null> {
        const query = `
            MATCH (user:User)
            WHERE user.name <> 'admin'
            AND (toLower(user.name) = toLower($name) 
            OR toLower(user.name) STARTS WITH toLower($name) 
            OR toLower(user.name) CONTAINS toLower(' ' + $name) 
            OR toLower(user.name) CONTAINS toLower($name))
            RETURN user, 
            CASE 
                WHEN toLower(user.name) = toLower($name) THEN 1
                WHEN toLower(user.name) STARTS WITH toLower($name) THEN 2
                WHEN toLower(user.name) CONTAINS toLower(' ' + $name) THEN 2
                WHEN toLower(user.name) CONTAINS toLower($name) THEN 3
            END as priority
            ORDER BY priority
        `
        const params = { name };
        const result = await chatappDB.cypher(query, params);
        return result.records.map(record => {
            const properties = record.get('user').properties;
            return new User(properties.id, properties.name, properties.email);
        });
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
        if (!user||user.get('name')==='admin') {
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
