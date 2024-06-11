import {Router} from 'express';
import { FriendRepository}  from '@src/infras/db/repository';
import { FriendUseCases}  from '@src/domain/use-cases';
import { FriendController } from '@src/adapters/controllers';
import { friendRoutes } from '@src/adapters/routes';

const friendRouter = Router()

const friendController = new FriendController(new FriendUseCases(new FriendRepository()));

const friendRoutesList = friendRoutes(friendController);

friendRoutesList.forEach(route => {
    (friendRouter as Router & Record<string,any>)[route.method](route.path, route.middlewares, route.handler)
})

export default friendRouter;