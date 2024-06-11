import IFriendRepository from "@src/domain/interfaces/IFriendRepository";
import {User} from "@src/domain/entities";
import { UserModel, FriendModel } from "../models";
class FriendRepository implements IFriendRepository {
    async createFriend(userId1: string, friendId: string): Promise<boolean> {
        const conditions = {
            $or: [
                { userId1: userId1, userId2: friendId },
                { userId1: friendId, userId2: userId1 }
            ]
        };
        const update = { userId1, userId2: friendId };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
        const friendDocument = await FriendModel.findOneAndUpdate(conditions, update, options);
    
        return !!friendDocument;
    }
    async checkFriend(userId: string, friendId: string): Promise<boolean> {
        const friendDocument = await FriendModel.findOne({
            $or: [
                { userId1: userId, userId2: friendId },
                { userId1: friendId, userId2: userId }
            ]
        });
        return !!friendDocument;
    }
    async getFriends(userId: string): Promise<User[]> {
        const userDocument = await UserModel.findById(userId);
        if (!userDocument) {
            throw new Error('User not found');
        }
        const friendDocuments = await FriendModel.find({
            $or: [
                { userId1: userId },
                { userId2: userId }
            ]
        });
        const friendIds = friendDocuments.map(friend => friend.userId1.toString() === userId ? friend.userId2.toString() : friend.userId1.toString());
        const friendUserDocuments = await UserModel.find({ _id: { $in: friendIds } });
        return friendUserDocuments.map(doc => new User(doc._id.toString(), doc.name, doc.email));
    }
    async deleteFriend(userId: string, friendId: string): Promise<boolean> {
        const result = await FriendModel.deleteOne({
            $or: [
                { userId1: userId, userId2: friendId },
                { userId1: friendId, userId2: userId }
            ]
        });
        return result.deletedCount === 1;
    }
}

export default FriendRepository;