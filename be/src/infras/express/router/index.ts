import userRouter from "./userRouter";
import authRouter from "./authRouter";
import friendRouter from "./friendRouter";
import conversationRouter from "./conversationRouter";
const router = require('express').Router();

router.use('/user', userRouter);
router.use('/', authRouter);
router.use('/friend', friendRouter);
router.use('/conversation', conversationRouter);

export default router;