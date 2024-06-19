import { UserRepository, FriendRepository } from "@src/infras/db/repository";
import { AuthUseCases } from "@src/domain/use-cases";

const authUseCases = new AuthUseCases(new UserRepository());

export default async function isAdmin(req: any, res: any, next: any) {
   const user = req.body.user;
    if (await user.isAdmin()) {
        next();
    } else {
        res.status(403).json({error: 'Not Admin User'});
    }
}        