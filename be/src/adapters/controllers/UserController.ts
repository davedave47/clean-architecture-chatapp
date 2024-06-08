import { UserUseCases } from '@domain/use-cases';
import e, {Request, Response} from 'express';

export default class UserController {
    private userUseCases: UserUseCases;
    constructor(userUseCases: UserUseCases) {
        this.userUseCases = userUseCases;
    }
    createUserController = async (req: Request, res: Response) => {
        try{
            const {name, email, password} = req.body;
            console.log('Creating user', name, email, password)
            const token = await this.userUseCases.createUser(name, email, password);
            res.status(201).cookie('token', token, {httpOnly: true}).json({message: 'Registered successfully'});
        }
        catch(e) {
            let status = 500;
            let error = 'Error creating user';
            if (e instanceof Error) {
                if (e.message === 'Name, email and password are required') {status = 400};
                error = e.message;
            }
            let code: string = (e as any).code || '500';
            if (code === '23505') {status = 409};
            console.error('Error creating user', e);
            res.status(status).json({error: (e as any).detail ?? (e as any).message});
        }
    }

    getUserByEmailController = async (req: Request, res: Response) => {
        try {
            const {email} = req.params;
            const user = await this.userUseCases.getUserByEmail(email);
            if (user) {
                res.json(user);
            }
            else {
                res.status(404).json({error: 'User not found'});
            }
        } catch (e) {
            console.error('Error getting user by email', e);
            res.status(500).json({error: 'Error getting user by email'});
        }
    }

    getAllUsersController = async (req: Request, res: Response) => {
        try {
            const users = await this.userUseCases.getAllUsers();
            res.json(users);
        } catch (e) {
            console.error('Error getting all users', e);
            res.status(500).json({error: 'Error getting all users'});
        }
    }
    loginController = async (req: Request, res: Response) => {
        try {
            const token = await this.userUseCases.login(req.body.email, req.body.password);
            if (token) {
                res.cookie('token', token, {httpOnly: true}).json({message: 'Logged in successfully'});
            } else {
                res.status(401).json({ error: 'Invalid email or password' });
            }
        } catch (e) {
            console.error('Error logging in user', e);
            res.status(500).json({error: 'Error logging in user'});
        }
    }
}
