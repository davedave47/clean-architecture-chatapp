import { UserController } from "@src/adapters/controllers";
import { passport, isAdmin, isSelforAdmin } from "../middlewares";
function userRoutes(controller: UserController) {
    const userRoutes = [
    {
        path: "/",
        method: "get",
        handler: controller.getUserController,
        middlewares: [passport.authenticate('jwt', {session: false})]
    },
    {
        path: "/users",
        method: "get",
        handler: controller.getAllUsersController,
        middlewares: [passport.authenticate('jwt', {session: false}),isAdmin]
    }, 
    {
        path: "/update",
        method: "put",
        handler: controller.updateUserController,
        middlewares: [passport.authenticate('jwt', {session: false})]
    },
    {
        path: "/changePassword",
        method: "put",
        handler: controller.updateUserPasswordController,
        middlewares: [passport.authenticate('jwt', {session: false})]
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
