import Message from './Message';
import User from './User';
export default class Conversation {
  constructor(
    public readonly id: string,
    public readonly participants: User[],
    public readonly createdAt: Date,
    public readonly name?: string,
    public readonly lastMessage?: Message,
  ) {}
}