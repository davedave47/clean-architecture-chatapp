import {Router} from 'express';
import { UserRepository}  from '@src/infras/db/repository';
import { UserUseCases}  from '@src/domain/use-cases';
import { UserController } from '@src/adapters/controllers';
import { userRoutes } from '@src/adapters/routes';

const userRouter = Router()

const userController = new UserController(new UserUseCases(new UserRepository()));

const userRoutesList = userRoutes(userController);

userRoutesList.forEach(route => {
    (userRouter as Router & Record<string,any>)[route.method](route.path, route.middlewares, route.handler)
})

export default userRouter;