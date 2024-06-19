import {Router} from 'express';
import { UserRepository, FriendRepository}  from '@src/infras/db/repository';
import { AuthUseCases}  from '@src/domain/use-cases';
import { AuthController } from '@src/adapters/controllers';
import { authRoutes } from '@src/adapters/routes';

const authRouter = Router()

const authController = new AuthController(new AuthUseCases(new UserRepository()));

const authRoutesList = authRoutes(authController);

authRoutesList.forEach(route => {
    (authRouter as Router & Record<string,any>)[route.method](route.path, route.middlewares, route.handler)
})

export default authRouter;