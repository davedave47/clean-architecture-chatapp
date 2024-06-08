import { PostgresDatabase, MongoDB } from "./databases";
import { Schema } from "mongoose";
const dbconfig = {
    user: process.env.DB_USER!,
    host: '127.0.0.1',
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: 27017
}

const chatappDB = new MongoDB(dbconfig);

function increaseId() {
    let id = 0;
    return () => {
        return id++;
    }
}

const UserSchema = new Schema({
    id: { type: Number, unique: true, default: increaseId()},
    name: { type: String, unique: true, required: true},
    email: { type: String, unique: true, required: true},
    password: {type: String, required: true},
    created_at: { type: Date, default: Date.now},
});

chatappDB.createModel('User', UserSchema);

export default chatappDB;