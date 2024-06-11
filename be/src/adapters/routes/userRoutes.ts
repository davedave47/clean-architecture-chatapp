import { UserController } from "@src/adapters/controllers";
import { passport, isAdmin, isSelforAdmin } from "../middlewares";
function userRoutes(controller: UserController) {
    const userRoutes = [
    {
        path: "/users",
        method: "get",
        handler: controller.getAllUsersController,
        middlewares: [passport.authenticate('jwt', {session: false}),isAdmin]
    }, 
    {
        path: "/:email",
        method: "get",
        handler: controller.getUserByEmailController,
        middlewares: [passport.authenticate('jwt', {session: false}),isSelforAdmin]
    }
    ]
    return userRoutes
}

export default userRoutes;
