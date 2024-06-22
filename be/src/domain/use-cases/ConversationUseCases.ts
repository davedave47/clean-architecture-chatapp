import IConversationRepository from "../interfaces/IConversationRepository";
import { Conversation, User, Message } from "../entities";
export default class ConversationUseCases {
    constructor(
        private conversationRepository: IConversationRepository
    ) {}
    async getConversations(userId: string, skip: number): Promise<Conversation[]> {
        const conversations = await this.conversationRepository.getConversations(userId, skip);
        console.log(conversations)
        const messages = await Promise.all(conversations.map(async (convo) => {
            return await this.conversationRepository.getMessages(convo.id, 1, 0);
        }));
        const participants = await Promise.all(conversations.map(async (convo) => {
            return await this.conversationRepository.getParticipants(convo.id);
        }));
        return conversations.map((convo, index) => {
            return new Conversation(
                convo.id,
                participants[index],
                convo.createdAt,
                convo.name,
                messages[index][0]
            );
        });
    }
    async getTalkedToUsers(userId: string): Promise<User[]>{
        return this.conversationRepository.getTalkedToUsers(userId);
    }
    async sendMessage(senderId: string, conversationId: string, content: {text: string, file: boolean}, createdAt: Date): Promise<Message>{
        return await this.conversationRepository.sendMessage(senderId, conversationId, content, createdAt);
    }
    async createConversation(users: User[]): Promise<Conversation>{
        return this.conversationRepository.createConversation(users);
    }
    async getMessages(conversationId: string, amount: number, skip: number): Promise<Message[]>{
        return this.conversationRepository.getMessages(conversationId, amount, skip);
    }
    async deleteConversation(conversationId: string): Promise<void>{
        return this.conversationRepository.deleteConversation(conversationId);
    }
    async deleteMessage(messageId: string): Promise<void>{
        return this.conversationRepository.deleteMessage(messageId);
    }
    async getParticipants(conversationId: string): Promise<User[]>{
        return this.conversationRepository.getParticipants(conversationId);
    }
    async participantInConversation(userId: string, conversationId: string): Promise<boolean>{
        const participants = await this.conversationRepository.getParticipants(conversationId);
        return participants.some(participant => participant.id === userId);
    }
}