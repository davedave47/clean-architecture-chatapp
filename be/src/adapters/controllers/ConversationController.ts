import { Request, Response } from 'express';
import { ConversationUseCases } from '@src/domain/use-cases';
class ConversationController {
    constructor(
        private conversationUseCases: ConversationUseCases,
    ) {}
    getConversations = async (req: Request, res: Response) => {
        try {
            const { user, skip } = req.body;
            const conversations = await this.conversationUseCases.getConversations(user.id, skip);
            res.json(conversations);
        } catch (e) {
            console.error('Error getting conversations', e);
            const error = e as any;
            res.status(500).json({ message: error.message });
        }
    }
    getMessages = async (req: Request, res: Response) => {
        try {
            const { conversationId, amount, skip, user } = req.body;
            if (conversationId == null || amount == null || skip == null || user == null) {
                res.status(400).json({ message: 'conversationId, amount, skip, and user are required' });
                return;
            }
            const participant = await this.conversationUseCases.participantInConversation(user.id, conversationId);
            if (!participant) {
                res.status(403).json({ message: 'You are not a participant in this conversation' });
                return;
            }
            const messages = await this.conversationUseCases.getMessages(conversationId, amount, skip);
            res.json(messages);
        } catch (e) {
            console.error('Error getting messages', e);
            const error = e as any;
            res.status(500).json({ message: error.message });
        }
    }
    createConversation = async (req: Request, res: Response) => {
        try {
            const { participants } = req.body;
            if (!participants) {
                res.status(400).json({ message: 'participants are required' });
                return;
            }
            if (participants.length < 2) {
                if (participants[0].id === req.body.user.id) {
                    res.status(400).json({ message: 'You cannot create a conversation with yourself' });
                    return;
                }
                participants.push(req.body.user);
            }
            if (!participants) {
                res.status(400).json({ message: 'participants are required' });
                return;
            }
            const conversation = await this.conversationUseCases.createConversation(participants);
            res.json(conversation);
        } catch (e) {
            console.error('Error creating conversation', e);
            const error = e as any;
            res.status(500).json({ message: error.message });
        }
    }
    
}

export default ConversationController;