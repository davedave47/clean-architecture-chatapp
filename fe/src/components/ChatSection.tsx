import { IMessage, IConversation } from "../interfaces";
import Message from "./Message";
import ChatSubmit from "./ChatSubmit";
import useSocket from "../hooks/useSocket";
import { useEffect, useState, useMemo, useRef } from "react";
import useFetchData from "../hooks/useFetchData";
import styles from '../styles/ChatSection.module.scss';
import {useDispatch} from 'react-redux';
import { setLatestMessage } from "../redux/convoSlice";

export default function ChatSection({conversation}: {conversation: IConversation}) {
    const dispatch = useDispatch();
    const socket = useSocket();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const canScroll = useRef(true);
    const skip = useRef(0);
    const url = `/api/conversation/messages`;
    const option: RequestInit = useMemo(() => ({
        method: 'POST',
        body: JSON.stringify({conversationId: conversation.id, amount: 20, skip: 0}),
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
        skip.current += 20;
        return () => {
            skip.current = 0;
            canScroll.current = true;
        }
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
                canScroll.current = true;
            }
            dispatch(setLatestMessage(message))
            skip.current += 1;
        });
        console.log("chat message listener added")
        return () => {
            socket.off('chat message');
            console.log("chat message listener removed")
        }
    }, [socket, conversation, dispatch]);

    useEffect(() => {
        if (messagesEndRef.current&&canScroll.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        }
    }, [messages]);
    function handleSend(message: string) {
        if (!socket) {
            return;
        }
        socket.emit('chat message', {content: {text: message, file: false}, conversationId: conversation.id, createdAt: new Date()});
        if (!messages) {
            return;
        }
    }
    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && !isLoading) {
            const topMessage = e.currentTarget.firstChild;
            setIsLoading(true);
            console.log("fetching messages")
            const result = await fetch(import.meta.env.VITE_BACKEND_URL+url, {
                ...option,
                body: JSON.stringify({conversationId: conversation.id, amount: 10, skip: skip.current})
            })
            const data = await result.json();
            skip.current += 10;
            setMessages(prevMessages => [...data, ...prevMessages]);
            setIsLoading(false);     
            canScroll.current = false;   
            if (topMessage) {
                (topMessage as HTMLElement).scrollIntoView();
            }    
        }
    }
    return (
        <>
            {   
                loading ? <p>Loading...</p>:
                error ? <p>Error: {error.message}</p>:
                <>
                    <div className={styles.messagesContainer} onScroll={handleScroll}>
                        {isLoading && <p>Loading...</p>}
                        {messages.map((message: IMessage) => {
                            return <Message key={message.id} message={message} />
                        })}
                        <div ref={messagesEndRef}> </div>
                    </div>
                    <ChatSubmit onSend={handleSend} />
                </>
            }
        </>
    )
}