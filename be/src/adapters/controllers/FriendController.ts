import { FriendUseCases } from '@domain/use-cases';
import {Request, Response} from 'express';
class FriendController {
    constructor(
        private friendUseCases: FriendUseCases
    ) {}
    addFriendController = async (req: Request, res: Response) => {
        try {
            const {user, friendId} = req.body;
            if (!user || !friendId) {
                res.status(400).json({error: 'id and friendId are required'});
                return;
            }
            if (user.id === friendId) {
                res.status(400).json({error: 'You cannot be friends with yourself'});
                return;
            }
            await this.friendUseCases.createFriend(user.id, friendId);
            res.json({message: 'Friend added successfully'});
        } catch (e) {     
            const error = e as any;           
            if (error.code === 11000) {
                return res.status(409).json({error: 'Friend already exists'});
            }
            if (error.message = "Friend not found") {
                return res.status(404).json({error: 'Friend not found'});
            }
            console.error('Error adding friend', e);
            res.status(500).json({error: 'Error adding friend'});
        }
    }
    unFriendController = async (req: Request, res: Response) => {
        try {
            const {user, friendId} = req.body;
            if (!user || !friendId) {
                res.status(400).json({error: 'id and friendId are required'});
                return;
            }
            if (user.id === friendId) {
                res.status(400).json({error: 'You cannot unfriend yourself'});
                return;
            }
            const result = await this.friendUseCases.deleteFriend(user.id, friendId);
            if (result) {
                res.json({message: 'Friend removed successfully'});
            } else {
                res.status(404).json({error: 'Friend not found'});
            }
        } catch (e) {
            console.error('Error removing friend', e);
            res.status(500).json({error: 'Error removing friend'});
        }
    }
    getFriendsController = async (req: Request, res: Response) => {
        try {
            const {id} = req.query;
            if (id === undefined&&req.body.id || id === req.body.id) {
                const friends = await this.friendUseCases.getFriends(req.body.id);
                if (friends) {
                    res.json({friends});
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
            const friends = await this.friendUseCases.getFriends(id);
            res.json({friends});
        } catch (e) {
            console.error('Error getting friends', e);
            res.status(500).json({error: 'Error getting friends'});
        }
    }
}
export default FriendController;