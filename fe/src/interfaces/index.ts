export interface IUser {
    id: string;
    username: string;
    email: string;
}


export interface IMessage {
    id: string;
    content: {
        text: string,
        file: boolean,
    };
    sender: IUser;
    conversationId: string;
    createdAt: string;
}


export interface IConversation {
    id: string;
    participants: IUser[];
    lastMessage?: IMessage;
    createdAt: Date;
    name?: string;
}
