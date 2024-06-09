import {createConnection} from "mongoose";
require('dotenv').config();

const dbconfig = {
    user: process.env.DB_USER!,
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB_PORT!)
}
function connectDB(config: {user: string, host: string, database: string, password: string, port: number}) {
        const db = createConnection(`mongodb://${config.host}:${config.port}/${config.database}`);
        console.log('Connected to MongoDB');
        return db;
}

const chatappDB = connectDB(dbconfig);


export default chatappDB;  