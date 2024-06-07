import userRouter from "./userRouter";
const router = require('express').Router();

router.use('/user', userRouter);

export default router;