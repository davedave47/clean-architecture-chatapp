import { UserUseCases } from "@src/domain/use-cases";
export default function isSelforAdmin(userUseCases: UserUseCases) {
        return async (req: any, res: any, next: any) => {
        const token = req.cookies['token'];
        const user = await userUseCases.getUserByToken(token);
        if (user && (user.isAdmin() || user.email === req.params.email)) {
            next();
        } else {
            res.status(403).json({error: 'You do not have permission to access this resource'});
        }
    }
}