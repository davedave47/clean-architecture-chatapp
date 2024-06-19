import { UserRepository} from "@src/infras/db/repository";
import { UserUseCases } from "@src/domain/use-cases";

const userUseCases = new UserUseCases(new UserRepository());

export default async function isSelforAdmin(req: any, res: any, next: any) {
    if (!req.cookies['token']) {
        res.status(401).json({error: 'You must be logged in to access this resource'});
        return;
    }
    const user = req.body.user;
    if (!user && !user.isAdmin()) {
        return res.status(403).json({error: 'You do not have permission to access this resource'});
    } 
    if (user.isAdmin()) {
        user.id = req.body.id;
        if (!user.id) {
            return res.status(400).json({error: 'No user id specified'});
        } 
        req.body.user = await userUseCases.getUserById(req.body.id);
    }
    next();
}        