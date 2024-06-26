import IConversationRepository from "@src/domain/interfaces/IConversationRepository";
import { Conversation, User, Message } from "@src/domain/entities";
import chatappDB from "../config/chatappDB";
import MessageModel from "../models/MessageModel";
import fs from 'fs';


export default class ConversationRepository implements IConversationRepository {
    async getConversations(userId: string,skip:number): Promise<{id: string, createdAt: Date, name?: string}[]> {
        const query = `
        MATCH (user:User {id: $userId})-[:PARTICIPANT]-(conversation: Conversation)
        RETURN conversation
        ORDER BY conversation.lastMessageAt DESC
        SKIP 0
        LIMIT 10`;
        const params = { userId, skip };
        const result = await chatappDB.cypher(query, params);
        return result.records.map(record => {
            const properties = record.get('conversation').properties;
            return {
                id: properties.id,
                createdAt: properties.createdAt,
                name: properties.name
            };
        });
    }
    async getTalkedToUsers(userId: string): Promise<User[]> {
        const query = `
        MATCH (user:User {id: $userId})-[:PARTICIPANT]-(conversation:Conversation)-[:PARTICIPANT]-(otherUser:User)
        WHERE otherUser.id <> $userId
        RETURN DISTINCT otherUser
    `;
        const params = { userId };
        const result = await chatappDB.cypher(query, params);
        return result.records.map(record => {
            const properties = record.get('otherUser').properties;
            return new User(properties.id, properties.name, properties.email);
        });
    }
    async sendMessage(senderId: string, conversationId: string, content: {text: string, file: boolean}, createdAt: Date): Promise<Message> {
        const message = new MessageModel({
            content,
            senderId,
            conversationId,
            createdAt
        });
        await message.save();
        const conversation = await chatappDB.first('Conversation', 'id', conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        const sender = await chatappDB.first('User', 'id', senderId);
        if (!sender) {
            throw new Error('User not found');
        }
        conversation.update({lastMessageAt: createdAt});
        return new Message(
            message.id,
            content,
            new User(senderId, sender.get('name'), sender.get('email')),
            conversationId,
            createdAt
        )
    }
    async createConversation(users: User[]): Promise<Conversation> {
        const query = `
        CREATE (c:Conversation {createdAt: $createdAt, id: randomUUID()})
        WITH c
        UNWIND $userIds AS userId
        MATCH (u:User {id: userId})
        CREATE (c)<-[:PARTICIPANT]-(u)
        RETURN c
    `;
        const userIds = users.map(user => user.id);
        const params = { userIds, createdAt: new Date().toISOString()};
        const result = await chatappDB.writeCypher(query, params);
        const conversation = result.records[0].get('c');
        return new Conversation(
            conversation.properties.id,
            users,
            conversation.properties.createdAt
        )
    }
    async getMessages(conversationId: string, amount: number, skip = 0): Promise<Message[]> {
        const messages = await MessageModel.find({conversationId})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(amount)
        .then(docs => docs.reverse());;
        const query = `
            MATCH (u:User)
            WHERE u.id IN $userIds
            RETURN u
        `
        const userIds = messages.map(message => message.senderId);
        const params = { userIds };
        const result = await chatappDB.cypher(query, params);
        const senders = result.records.map(record => new User(record.get('u').properties.id, record.get('u').properties.name, record.get('u').properties.email));
        return messages.map((message) => new Message(
            message._id.toString(),
            message.content!,
            senders.find(sender => sender.id === message.senderId)!,
            message.conversationId,
            message.createdAt
        ));
    }
    async deleteConversation(conversationId: string): Promise<void> {
        const conversation = await chatappDB.first('Conversation', 'id', conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        await conversation.delete();
    }        
    async deleteMessage(messageId: string): Promise<void> {
        const message = await MessageModel.deleteOne({
            _id: messageId
        })
    }
    async getParticipants(conversationId: string): Promise<User[]> {
        const query = `
        MATCH (conversation:Conversation {id: $conversationId})-[:PARTICIPANT]-(user:User)
        RETURN user
    `;
        const params = { conversationId };
        const result = await chatappDB.cypher(query, params);
        return result.records.map(record => {
            const {id, name, email} = record.get('user').properties;
            return new User(id, name, email);
        });
    }
    async uploadFile(filename: string, file: ArrayBuffer): Promise<string> {
        const buffer = Buffer.from(file);
        filename = filename+'-'+Date.now().toString();
        fs.writeFileSync(`./uploads/${filename}`, buffer);
        return filename;
    }
}