import IFriendRepository from "@src/domain/interfaces/IFriendRepository";
import {User} from "@src/domain/entities";
import chatappDB from "../config/chatappDB";
class FriendRepository implements IFriendRepository {
    async createFriend(userId1: string, friendId: string): Promise<boolean> {
        const user1 = await chatappDB.first('User', 'id', userId1);
        if (!user1) {
            throw new Error('User not found');
        }
        const user2 = await chatappDB.first('User', 'id', friendId);
        if (!user2) {
            throw new Error('Friend not found');
        }
        user1.relateTo(user2, 'friends');
        return true;
    }
    async checkFriend(userId: string, friendId: string): Promise<boolean> {
        const query = `
        MATCH (user1:User {id: $userId})-[r:FRIEND_OF]-(user2:User {id: $friendId})
        RETURN COUNT(r) > 0 AS friends
    `;
        const params = { userId, friendId};
        const result = await chatappDB.cypher(query, params);
        return result.records[0].get('friends');
    }
    async getFriends(userId: string): Promise<User[]> {
        const query = `
        MATCH (user:User {id: $userId})-[r:FRIEND_OF]-(friend:User)
        RETURN friend
    `;
        const params = { userId };
        const result = await chatappDB.cypher(query, params);
        return result.records.map(record => {
            const {id, name, email} = record.get('friend').properties;
            return new User(id, name, email);
        });
    }
    async deleteFriend(userId: string, friendId: string): Promise<boolean> {
        const query = `
        MATCH (user1:User {id: $userId})-[r:FRIEND_OF]-(user2:User {id: $friendId})
        DELETE r
    `;
        const params = { userId, friendId };
        const result = await chatappDB.writeCypher(query, params);
        return result.summary.counters.updates().relationshipsDeleted === 1;
    }
    async requestFriend(userId: string, friendId: string): Promise<boolean> {
        const query = `
        MATCH (user1:User {id: $userId}), (user2:User {id: $friendId})
        MERGE (user1)-[r:REQUEST]->(user2)
        `
        const params = { userId, friendId };
        const result = await chatappDB.writeCypher(query, params);
        return result.summary.counters.updates().relationshipsCreated === 1;
    }
    async rejectFriendRequest(userId: string, friendId: string): Promise<boolean> {
        const query = `
        MATCH (user1:User {id: $userId})<-[r:REQUEST]-(user2:User {id: $friendId})
        DELETE r
    `;
        const params = { userId, friendId };
        const result = await chatappDB.writeCypher(query, params);
        return result.summary.counters.updates().relationshipsDeleted === 1;
    }
    async getReceivedFriendRequests(userId: string): Promise<User[]> {
        const query = `
        MATCH (user:User {id: $userId})<-[r:REQUEST]-(requester:User)
        RETURN requester
    `;
        const params = { userId };
        const result = await chatappDB.cypher(query, params);
        return result.records.map(record => {
            const {id, name, email} = record.get('requester').properties;
            return new User(id, name, email);
        });
    }
    async getSentFriendRequests(userId: string): Promise<User[]> {
        const query = `
        MATCH (user:User {id: $userId})-[r:REQUEST]->(requestee:User)
        RETURN requestee
    `;
        const params = { userId };
        const result = await chatappDB.cypher(query, params);
        return result.records.map(record => {
            const {id, name, email} = record.get('requestee').properties;
            return new User(id, name, email);
        });
    }
}

export default FriendRepository;