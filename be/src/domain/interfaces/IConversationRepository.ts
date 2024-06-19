import { Conversation, User, Message } from "../entities";
export default interface IConversationRepository {
    getConversations(userId: string,skip: number): Promise<{id: string, createdAt: Date, name?: string}[]>;
    getTalkedToUsers(userId: string): Promise<User[]>;
    sendMessage(senderId: string, conversationId: string, content: {text: string, file: boolean}, createdAt: Date): Promise<Message>;
    createConversation(users: User[]): Promise<Conversation>;
    getMessages(conversationId: string, amount: number, skip: number): Promise<Message[]>;
    deleteConversation(conversationId: string): Promise<void>;
    deleteMessage(messageId: string): Promise<void>;
    getParticipants(conversationId: string): Promise<User[]>
}
