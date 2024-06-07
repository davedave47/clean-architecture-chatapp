import { PostgresDatabase } from "./databases";

const dbconfig = {
    user: process.env.DB_USER!,
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB_PORT || '5432')
}

const chatappDB = new PostgresDatabase(dbconfig);

export default chatappDB;