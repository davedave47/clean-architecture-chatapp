import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator'
import {Client} from 'pg';
import {users} from './schema';
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbconfig = {
    user: process.env.DB_USER!,
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB_PORT || '5432')
}
async function main() {
    const client = new Client(dbconfig);
    await client.connect()
    const drizzleDB = drizzle(client);
    await migrate(drizzleDB, {
        migrationsFolder: __dirname + '/migrations'});
    const admin = {
        name: process.env.ADMIN_NAME!,
        email: process.env.ADMIN_EMAIL!,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, process.env.SALT||10)
    }
    await drizzleDB.insert(users).values(admin)
    await client.end();
}

main()