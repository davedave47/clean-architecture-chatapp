import { ConversationController } from "@src/adapters/controllers";
import { ConversationUseCases } from "@src/domain/use-cases";
import { ConversationRepository } from "@src/infras/db/repository";
import { conversationRoutes } from "@src/adapters/routes";
import { Router } from "express";

const conversationRouter = Router();

const conversationRepository = new ConversationRepository();
const conversationUseCases = new ConversationUseCases(conversationRepository);
const conversationController = new ConversationController(conversationUseCases);

const conversationRoutesList = conversationRoutes(conversationController);

conversationRoutesList.forEach(route => {
    (conversationRouter as Router & Record<string,any>)[route.method](route.path, route.middlewares, route.handler)
});

export default conversationRouter;