import  User from './User';
export default class Message {
    constructor(
        public readonly id: string,
        public readonly content: {text: string, file: boolean},
        public readonly sender: User,
        public readonly conversationId: string,
        public readonly createdAt: Date,
    ) {}
}