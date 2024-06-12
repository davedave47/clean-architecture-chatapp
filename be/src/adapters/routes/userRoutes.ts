import { UserController } from "@src/adapters/controllers";
import { passport, isAdmin, isSelforAdmin, cookieExtractor } from "../middlewares";
import IRoute  from "@src/domain/interfaces/IRoute";
function userRoutes(controller: UserController): IRoute[] {
    const userRoutes = [
    {
        path: "/",
        method: "get",
        handler: controller.getUserController,
        middlewares: [cookieExtractor]
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
        middlewares: [passport.authenticate('jwt', {session: false}),isSelforAdmin]
    },
    {
        path: "/changePassword",
        method: "put",
        handler: controller.updateUserPasswordController,
        middlewares: [passport.authenticate('jwt', {session: false}),isSelforAdmin]
    },
    {
        path: "/delete",
        method: "delete",
        handler: controller.deleteUserController,
        middlewares: [passport.authenticate('jwt', {session: false}),isSelforAdmin]
    },
    {
        path: "/:email",
        method: "get",
        handler: controller.getUserByEmailController,
        middlewares: [passport.authenticate('jwt', {session: false}),isAdmin]
    }
    ]
    return userRoutes
}

export default userRoutes;
