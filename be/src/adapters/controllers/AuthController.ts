import { Request, Response } from 'express';
import { AuthUseCases } from '@domain/use-cases';
export default class AuthController {
    constructor(
        private authUseCases: AuthUseCases
    ) {}
    registerController = async (req: Request, res: Response) => {
        try{
            const {name, email, password} = req.body;
            console.log('Creating user', name, email, password)
            const token = await this.authUseCases.createUser(name, email, password);
            res.status(201).cookie('token', token, {httpOnly: true, sameSite: "lax", maxAge: 60*1000*60}).json({message: 'Registered successfully'});
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
    loginController = async (req: Request, res: Response) => {
        try {
            const token = await this.authUseCases.login(req.body.email, req.body.password);
            if (token) {
                res.status(201).cookie('token', token, {httpOnly: true, sameSite: "lax", maxAge: 60*1000*60}).json({message: 'Logged in successfully'});
            } else {
                res.status(401).json({ error: 'Invalid email or password' });
            }
        } catch (e) {
            console.error('Error logging in user', e);
            res.status(500).json({error: 'Error logging in user'});
        }
    }
    logoutController = async (req: Request, res: Response) => {
        res.clearCookie('token').json({message: 'Logged out successfully'});
    }
}