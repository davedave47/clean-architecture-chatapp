import { UserUseCases } from "@src/domain/use-cases";
export default function isAdmin(userUseCases: UserUseCases) {
        return async (req: any, res: any, next: any) => {
        const token = req.cookies['token'];
        const user = await userUseCases.getUserByToken(token);
        if (user && user.isAdmin()) {
            next();
        } else {
            res.status(403).json({error: 'Not Admin User'});
        }
    }
}