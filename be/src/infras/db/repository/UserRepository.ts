// infrastructure/userRepositoryImpl.ts
import { User } from '@domain/entities';
import IUserRepository from '@src/domain/interfaces/IUserRepository';

export default class UserRepository implements IUserRepository{
    private db: any;
    constructor(db: any) {
        this.db = db;
    }
    async createUser(name: string, email: string, password: string): Promise<User> {
        const result = await this.db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, password, created_at, updated_at',
            [name, email, password]
        );
        const newUser = new User(result.rows[0].id, result.rows[0].username, result.rows[0].email, result.rows[0].password);
        return newUser;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const newUser = new User(result.rows[0].id, result.rows[0].username, result.rows[0].email, result.rows[0].password);
            return newUser;
        }
        return null;
    }

    async getAllUsers(): Promise<User[]> {
        const result = await this.db.query('SELECT * FROM users',[]);
        const users = result.rows.map((row: any) => new User(row.id, row.username, row.email, row.password));
        return users;
    }
    async getUserById(id: number): Promise<User | null> {
        const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
        const newUser = new User(result.rows[0].id, result.rows[0].username, result.rows[0].email, result.rows[0].password);
        return newUser;
    }
}


