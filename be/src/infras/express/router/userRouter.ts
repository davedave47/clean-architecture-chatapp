import express, {Router} from 'express';
import { UserRepository }  from '@src/infras/db/repository';
import { UserUseCases }  from '@src/domain/use-cases';
import { userRoutes } from '@src/adapters/routes';
import chatappDB from '@src/infras/db/config/chatappDB';


const userRouter = express.Router()

const userUseCase = new UserUseCases(new UserRepository(chatappDB));
const userRoutesList = userRoutes(userUseCase);

userRoutesList.forEach(route => {
    (userRouter as Router & Record<string,any>)[route.method](route.path, route.middlewares, route.handler)
})

export default userRouter;