import {User} from "../entities";
import IFriendRepository from "../interfaces/IFriendRepository";

class FriendUseCases {
    constructor(private friendRepository: IFriendRepository) {}

    async createFriend(userId: string, friendId: string): Promise<boolean> {
        return this.friendRepository.createFriend(userId, friendId);
    }
    async getFriends(userId: string): Promise<User[]> {
        return this.friendRepository.getFriends(userId);
    }
    async deleteFriend(userId: string, friendId: string): Promise<boolean> {
        return this.friendRepository.deleteFriend(userId, friendId);
    }
}

export default FriendUseCases;