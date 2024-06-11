import { FriendUseCases } from '@domain/use-cases';
import {Request, Response} from 'express';
class FriendController {
    constructor(
        private friendUseCases: FriendUseCases
    ) {}
    addFriendController = async (req: Request, res: Response) => {
        try {
            const {userId, friendId} = req.body;
            if (!userId || !friendId) {
                res.status(400).json({error: 'userId and friendId are required'});
                return;
            }
            if (userId === friendId) {
                res.status(400).json({error: 'You cannot be friends with yourself'});
                return;
            }
            const result = await this.friendUseCases.createFriend(userId, friendId);
            if (result) {
                res.json({message: 'Friend added successfully'});
            } else {
                res.status(409).json({error: 'Friend already exists'});
            }
        } catch (e) {
            console.error('Error adding friend', e);
            res.status(500).json({error: 'Error adding friend'});
        }
    }
    unFriendController = async (req: Request, res: Response) => {
        try {
            const {userId, friendId} = req.body;
            if (!userId || !friendId) {
                res.status(400).json({error: 'userId and friendId are required'});
                return;
            }
            if (userId === friendId) {
                res.status(400).json({error: 'You cannot unfriend yourself'});
                return;
            }
            const result = await this.friendUseCases.deleteFriend(userId, friendId);
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
            const {userId} = req.body;
            if (!userId) {
                res.status(400).json({error: 'userId is required'});
                return;
            }
            const friends = await this.friendUseCases.getFriends(userId);
            res.json({friends});
        } catch (e) {
            console.error('Error getting friends', e);
            res.status(500).json({error: 'Error getting friends'});
        }
    }
}
export default FriendController;