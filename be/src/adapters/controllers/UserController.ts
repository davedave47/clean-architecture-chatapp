import { UserUseCases } from '@domain/use-cases';
import {Request, Response} from 'express';

export default class UserController {
    constructor(
        private userUseCases: UserUseCases,
    ) {}
    getUserController = async (req: Request, res: Response) => {
        try {
            const {id} = req.query;
            if (id === undefined&&req.body.id) {
                const user = await this.userUseCases.getUserById(req.body.id);
                if (user) {
                    res.json({user});
                }
                else {
                    res.status(404).json({error: 'User not found'});
                }
                return;
            }
            if (typeof id !== 'string') {
                res.status(400).json({error: 'Invalid id'});
                return;
            }
            const user = await this.userUseCases.getUserById(id);
            if (user) {
                res.json({user});
            }
            else {
                res.status(404).json({error: 'User not found'});
            }
        } catch (e) {
            console.error('Error getting user', e);
            res.status(500).json({error: 'Error getting user'});
        }
    }
    getUserByEmailController = async (req: Request, res: Response) => {
        if (req.body.user) {
            res.json({user: req.body.user});
            return;
        }
        try {
            const {email} = req.params;
            const user = await this.userUseCases.getUserByEmail(email);
            if (user) {
                res.json({user});
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
            res.json({users});
        } catch (e) {
            console.error('Error getting all users', e);
            res.status(500).json({error: 'Error getting all users'});
        }
    }
    updateUserController = async (req: Request, res: Response) => {
        try {
            const {user, id, ... changes} = req.body;
            const newUser = await this.userUseCases.updateUser({...user, ...changes});
            if (newUser) {
                res.json({message: "Update Successful", newUser});
            } else {
                res.status(404).json({error: 'User not found'});
            }
        } catch (e) {
            const error = e as any;           
            if (error.code === 11000) {
                return res.status(409).json({error: 'Overlapping email or username'});
            }
            console.error('Error updating user info', e);
            res.status(500).json({error: 'Error updating user info'});
        }
    }
    updateUserPasswordController = async (req: Request, res: Response) => {
        try {
            const {user, password} = req.body;
            const newUser = await this.userUseCases.updateUserPassword(user.id, password);
            if (user) {
                res.json({message: "Update Successful", newUser});
            } else {
                res.status(404).json({error: 'User not found'});
            }
        } catch (e) {
            console.error('Error updating user password', e);
            res.status(500).json({error: 'Error updating user password'});
        }
    }
    deleteUserController = async (req: Request, res: Response) => {
        try {
            const {user} = req.body;
            const result = await this.userUseCases.deleteUser(user.id);
            if (result) {
                res.json({message: 'User deleted successfully'});
            } else {
                res.status(404).json({error: 'User not found'});
            }
        } catch (e) {
            console.error('Error deleting user', e);
            res.status(500).json({error: 'Error deleting user'});
        }
    }
}
