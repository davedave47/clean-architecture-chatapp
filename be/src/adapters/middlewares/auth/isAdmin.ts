import { UserRepository, FriendRepository } from "@src/infras/db/repository";
import { AuthUseCases } from "@src/domain/use-cases";

const authUseCases = new AuthUseCases(new UserRepository(), new FriendRepository());

export default async function isAdmin(req: any, res: any, next: any) {
   const {userId} = req.body;
    if (!userId) {
        res.status(401).json({error: 'You must be logged in to access this resource'});
        return;
    }
    if (await authUseCases.isAdmin(userId)) {
        next();
    } else {
        res.status(403).json({error: 'Not Admin User'});
    }
}        