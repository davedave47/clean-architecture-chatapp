// project
import { User } from '@domain/entities';
import IUserRepository from '@domain/interfaces/IUserRepository';
import chatappDB from '../config/chatappDB';
// drivers
import {users} from '../config/schema';
import {eq} from 'drizzle-orm';

export default class UserRepository implements IUserRepository {
    async createUser(name: string, email: string, password: string): Promise<User> {
        const rows = await chatappDB.insert(users).values({name, email, password})
                                    .returning({insertedId: users.id});
        return new User(rows[0].insertedId.toString(), name, email, password);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const rows = await chatappDB.select().from(users).where(eq(users.email,email));
        if (rows.length > 0) {
            const user = rows[0];
            return new User(user.id.toString(), user.name, user.email, user.password);
        }
        return null;
    }

    async getAllUsers(): Promise<User[]> {
        const rows = await chatappDB.select().from(users);
        return rows.map((user: any) => new User(user.id.toString(), user.name, user.email, user.password));
    }

    async getUserById(id: string): Promise<User | null> {
        const rows = await chatappDB.select().from(users).where(eq(users.id, id));
        if (rows.length > 0) {
            const user = rows[0];
            return new User(user.id.toString(), user.name, user.email, user.password);
        }
        return null;
    }
}
