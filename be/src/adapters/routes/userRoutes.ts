import { UserUseCases } from "@src/domain/use-cases";
import { UserController } from "@src/adapters/controllers";
import { passportMiddleware, isAdmin, isSelforAdmin } from "../middlewares";
function userRoutes(userUseCase: UserUseCases) {
    
    const controller = new UserController(userUseCase);

    const passport = passportMiddleware(userUseCase);
    const adminAuth = isAdmin(userUseCase);
    const isSelforAdminAuth = isSelforAdmin(userUseCase);
    
    const userRoutes = [{
        path: "/register",
        method: "post",
        handler: controller.createUserController,
        middlewares: []
    }, 
    {
        path: "/users",
        method: "get",
        handler: controller.getAllUsersController,
        middlewares: [passport.authenticate('jwt', {session: false}),adminAuth]
    }, 
    {
        path: "/login",
        method: "post",
        handler: controller.loginController,
        middlewares: []
    },
    {
        path: "/:email",
        method: "get",
        handler: controller.getUserByEmailController,
        middlewares: [passport.authenticate('jwt', {session: false}),isSelforAdminAuth]
    }
    ]
    return userRoutes
}

export default userRoutes;
