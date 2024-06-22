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
    async requestFriend(userId: string, friendId: string): Promise<boolean> {
        return this.friendRepository.requestFriend(userId, friendId);
    }
    async acceptFriendRequest(userId: string, friendId: string): Promise<boolean> {
        await this.friendRepository.rejectFriendRequest(userId, friendId);
        return this.friendRepository.createFriend(userId, friendId);
    }
    async rejectFriendRequest(userId: string, friendId: string): Promise<boolean> {
        return this.friendRepository.rejectFriendRequest(userId, friendId);
    }
    async getFriendRequests(userId: string): Promise<{sent: User[], received: User[]}> {
        const received = await this.friendRepository.getReceivedFriendRequests(userId);
        const sent = await this.friendRepository.getSentFriendRequests(userId);
        return {sent, received};
    }
}

export default FriendUseCases;