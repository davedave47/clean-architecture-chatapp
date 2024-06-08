const {Pool} = require('pg');
require('dotenv').config();
class PostgresDatabase {
    private pool: any;
    constructor(config: {user:string, host:string, database:string, password:string, port:number}){
        this.pool = new Pool({
            user: config.user,
            host: config.host,
            database: config.database,
            password: config.password,
            port: config.port,
        });
    }
    async connect(): Promise<void> {
        try {
            await this.pool.connect();
            console.log('Connected to database');
        } catch (e) {
            console.error('Database connection error', e);
        }
    }
    async disconnect(): Promise<void> {
        try {
            await this.pool.end();
            console.log('Disconnected from database');
        } catch (e) {
            console.error('Database disconnection error', e);
        }
    }
    async query(sql: string, params: any[]): Promise<any> {
        try {
            const result = await this.pool.query(sql, params);
            return result;
        } catch (e) {
            console.error('Database query error', e);
            throw e;
        }
    }
    isConnected(): boolean {
        return this.pool !== null;
    }
}

export default PostgresDatabase;

