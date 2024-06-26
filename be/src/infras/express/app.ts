import express, { Request, Response } from 'express';
import router from './router'
import path from 'path';
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
app.use('/uploads', express.static('./../../../uploads'));

app.get("/uploads/:id", (req: Request, res: Response) => { 
    const filePath = path.resolve(__dirname, './../../../uploads', req.params.id);
    const filename = req.params.id.replace(/-\d+$/, '');
    res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
    res.sendFile(filePath);
})

app.get("*", (req: Request, res: Response) => {
    console.log("Hello World");
    res.status(404).json({text: "Invalid route"});
});


export default app;