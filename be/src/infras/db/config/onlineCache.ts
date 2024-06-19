import { createClient } from "redis";
require("dotenv").config();

function connectDB(url: string) {
    const db = createClient({url});
    db.connect();
    console.log('Connected to Redis');
    return db;
}

const onlineCache = connectDB(process.env.REDIS_URL!);
export default onlineCache;




