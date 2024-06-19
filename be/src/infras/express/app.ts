import express, { Request, Response } from 'express';
import router from './router'
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL!,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use('/api', router);

app.get("*", (req: Request, res: Response) => {
    console.log("Hello World");
    res.status(404).json({text: "Invalid route"});
});


export default app;