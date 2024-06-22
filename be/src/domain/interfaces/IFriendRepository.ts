import {User} from "../entities";
export default interface IFriendRepository {
    createFriend(userId1: string, friendId: string): Promise<boolean>;
    checkFriend(userId: string, friendId: string): Promise<boolean>;
    getFriends(userId: string): Promise<User[]>;
    deleteFriend(userId: string, friendId: string): Promise<boolean>;
    requestFriend(userId: string, friendId: string): Promise<boolean>;
    rejectFriendRequest(userId: string, friendId: string): Promise<boolean>;
    getSentFriendRequests(userId: string): Promise<User[]>;
    getReceivedFriendRequests(userId: string): Promise<User[]>;
}