import  User from './User';
export default class Message {
    constructor(
        public readonly id: string,
        public readonly content: {text: string, file: boolean},
        public readonly userId: string,
        public readonly chatId: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly sender: User
    ) {}
}