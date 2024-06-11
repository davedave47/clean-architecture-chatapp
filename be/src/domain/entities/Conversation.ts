import Message from './Message';
import User from './User';
export default class Conversation {
  constructor(
    public readonly id: string,
    public readonly users: User[],
    public readonly messages: Message[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}