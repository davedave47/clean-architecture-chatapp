import express, { Request, Response } from 'express';
import router from './router'

const cookieParser = require('cookie-parser');

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use('/api', router);

app.get("*", (req: Request, res: Response) => {
    console.log("Hello World");
    res.status(404).json({text: "Invalid route"});
});


export default app;