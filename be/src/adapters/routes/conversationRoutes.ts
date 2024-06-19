import { ConversationController } from "../controllers";
import { passport } from "../middlewares";

export default function conversationRoutes(conversationController: ConversationController) {
    return [
        {
            path: "/",
            method: "get",
            handler: conversationController.getConversations,
            middlewares: [passport.authenticate('jwt', {session: false})]
        },
        {
            path: "/messages",
            method: "post",
            handler: conversationController.getMessages,
            middlewares: [passport.authenticate('jwt', {session: false})]
        },
        {
            path: "/create",
            method: "post",
            handler: conversationController.createConversation,
            middlewares: [passport.authenticate('jwt', {session: false})]
        }
    ]
}