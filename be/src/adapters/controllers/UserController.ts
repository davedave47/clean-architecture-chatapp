import { UserUseCases } from '@domain/use-cases';
import {Request, Response} from 'express';

export default class UserController {
    constructor(
        private userUseCases: UserUseCases,
    ) {}
    getUserController = async (req: Request, res: Response) => {
        if (req.user) {
            res.json({user: req.user});
            return;
        }
        try {
            const {id} = req.params;
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
        if (req.user) {
            res.json({user: req.user});
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
            const user = await this.userUseCases.updateUser(req.body);
            if (user) {
                res.json({message: "Update Successful", user});
            } else {
                res.status(404).json({error: 'User not found'});
            }
        } catch (e) {
            console.error('Error updating user email', e);
            res.status(500).json({error: 'Error updating user email'});
        }
    }
    updateUserPasswordController = async (req: Request, res: Response) => {
        try {
            const {userId, password} = req.body;
            const user = await this.userUseCases.updateUserPassword(userId, password);
            if (user) {
                res.json({message: "Update Successful", user});
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
            const {id} = req.params;
            const result = await this.userUseCases.deleteUser(id);
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
