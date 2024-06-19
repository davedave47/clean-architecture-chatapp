import { IMessage, IConversation } from "../interfaces";
import Message from "./Message";
import ChatSubmit from "./ChatSubmit";
import useSocket from "../hooks/useSocket";
import { useEffect, useState, useMemo } from "react";
import useFetchData from "../hooks/useFetchData";

export default function ChatSection({conversation}: {conversation: IConversation}) {
    const socket = useSocket();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const url = `http://localhost:3000/api/conversation/messages`;
    const option: RequestInit = useMemo(() => ({
        method: 'POST',
        body: JSON.stringify({conversationId: conversation.id, amount: 10, skip: 0}),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }),[conversation.id]);
    const [data, loading, error] = useFetchData<IMessage[]>(url,option);
    useEffect(() => {
        if (!data) {
            return;
        }
        setMessages(data);
    }, [data]);
    useEffect(() => {
        if (!socket) {
            return;
        }
        console.log(socket.id)
        socket.on('chat message', (message: IMessage) => {
            console.log("received: ", message)
            if (message.conversationId === conversation.id) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        });
        console.log("chat message listener added")
        return () => {
            socket.off('chat message');
            console.log("chat message listener removed")
        }
    }, [socket, conversation.id]);

    if (loading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }
    if (!messages) {
        return <p>Loading...</p>;
    }
    function handleSend(message: string) {
        if (!socket) {
            return;
        }
        socket.emit('chat message', {content: {text: message, file: false}, conversationId: conversation.id, createdAt: new Date()});
        if (!messages) {
            return;
        }
    }
    return (
        <div style={
            {
                display: 'flex',
                flexDirection: 'column',
            }
        }>
            {messages.map((message: IMessage) => {
                return <Message key={message.id} message={message} />
            })}
            <ChatSubmit onSend={handleSend} />
        </div>
    )
}