import { UserRepository, FriendRepository } from "@src/infras/db/repository";
import { AuthUseCases } from "@src/domain/use-cases";

const authUseCases = new AuthUseCases(new UserRepository(), new FriendRepository());

export default async function isSelforAdmin(req: any, res: any, next: any) {
    if (!req.cookies['token']) {
        res.status(401).json({error: 'You must be logged in to access this resource'});
        return;
    }
    let user;
    const token = req.cookies['token'];
    if (req.user) {
        user = req.user;
    }
    else {
        user = await authUseCases.getUserByToken(token);
    }
    if (user && (user.isAdmin() || user.email === req.params.email)) {
        next();
    } else {
        res.status(403).json({error: 'You do not have permission to access this resource'});
    }
}        