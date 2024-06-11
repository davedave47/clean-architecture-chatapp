import FriendController from "../controllers/FriendController";
import { passport } from "../middlewares";

export default function friendRoutes(controller: FriendController) {
    const friendRoutes = [
        {
            path: "/",
            method: "get",
            handler: controller.getFriendsController,
            middlewares: [passport.authenticate('jwt', {session: false})]
        },
        {
            path: "/add",
            method: "post",
            handler: controller.addFriendController,
            middlewares: [passport.authenticate('jwt', {session: false})]
        },
        {
            path: "/remove",
            method: "post",
            handler: controller.unFriendController,
            middlewares: [passport.authenticate('jwt', {session: false})]
        }
    ]
    return friendRoutes;
}