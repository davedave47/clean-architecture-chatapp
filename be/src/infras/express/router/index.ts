import userRouter from "./userRouter";
import authRouter from "./authRouter";
import friendRouter from "./friendRouter";
const router = require('express').Router();

router.use('/user', userRouter);
router.use('/', authRouter);
router.use('/friend', friendRouter);

export default router;