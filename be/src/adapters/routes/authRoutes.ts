import { AuthController } from "../controllers";
import { passport } from "../middlewares";
export default function authRoutes(controller: AuthController) {
    const authRoutes = [{
        path: "/register",
        method: "post",
        handler: controller.registerController,
        middlewares: []
    }, 
    {
        path: "/login",
        method: "post",
        handler: controller.loginController,
        middlewares: []
    },
    {
        path: "/logout",
        method: "get",
        handler: controller.logoutController,
        middlewares: [passport.authenticate('jwt', {session: false})]
    }
    ]
    return authRoutes;
}