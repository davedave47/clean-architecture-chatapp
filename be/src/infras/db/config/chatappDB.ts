import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from './schema';
import * as drizzleorm from 'drizzle-orm'
require('dotenv').config();

const dbconfig = {
    user: process.env.DB_USER!,
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB_PORT || '5432')
}
function connectDB(config: {user: string, host: string, database: string, password: string, port: number}) {
    const pool = new Pool(config);
    console.log('Connected to database');
    return drizzle(pool, {schema, logger: true});
}

const chatappDB = connectDB(dbconfig);

export default chatappDB;  