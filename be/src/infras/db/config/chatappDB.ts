import {createConnection} from "mongoose";
require('dotenv').config();

const dbconfig = {
    user: process.env.DB_USER!,
    host: '127.0.0.1',
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: 27017
}

const uri = `mongodb://${dbconfig.host}:${dbconfig.port}/${dbconfig.database}`
const chatappDB = createConnection(uri);
console.log('Connected to MongoDB');

export default chatappDB;  