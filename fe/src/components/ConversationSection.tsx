import Conversations from "./Conversations";
import ChatSection from "./ChatSection";
import { ConversationCreator } from "./ConversationCreator";
import {useState, useCallback, useEffect,useMemo} from 'react';
import { IConversation, IMessage, IUser } from "../interfaces";
import useFetchData from "../hooks/useFetchData";
import useSocket from "../hooks/useSocket";
import chatStyles from '../styles/ChatSection.module.scss';
export default function ConversationSection() {
    console.log("conversation section mounted")
    const uri = 'api/conversation';
    const [isCreating, setIsCreating] = useState(false)
    const option: RequestInit = useMemo(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }),[]);
    const [data, loading, error] = useFetchData<IConversation[]>(uri, option);
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [currentConvo, setCurrentConvo] = useState<IConversation | null>(null);
    useEffect(() => {
        if (data && data.length > 0 && !currentConvo) {
            setCurrentConvo(data[0]);
            setConversations(data);
        }
    }, [data, currentConvo]);    
    const socket = useSocket();
    useEffect(() => {
        socket?.on("convo", (convo) => {
            console.log("received", convo)
            setConversations(prev => [convo,...prev])
            setCurrentConvo(convo)
        })
        return () =>{
            socket?.off("convo")
        }
    },[socket])

    const handleClick = useCallback(( conversation: IConversation) => {
        setCurrentConvo(conversation);
    },[])
    async function handlecreateConversation(participants: IUser[]) {
        socket?.emit("create convo", participants)
        setIsCreating(false)
    }
    function handleReceive(message: IMessage) {
        setConversations(prevConversations => {
            const index = prevConversations.findIndex(conversation => conversation.id === message.conversationId);
            if (index !== -1) {
            const updatedConversation = {
                ...prevConversations[index],
                lastMessage: message
            };
            return [
                updatedConversation,
                ...prevConversations.slice(0, index),
                ...prevConversations.slice(index + 1)
            ];
        }
        return prevConversations;
        })
    }
    return (
        <div style={
            {
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '80%'
            }
        }>  {isCreating ? <ConversationCreator onCreate={handlecreateConversation}/>:
            loading ? <p>Loading...</p> : error? <p>Error: {error.message}</p>: <Conversations onCreateConversation={()=>{setIsCreating(true)}} onClick={handleClick}  selected={currentConvo} conversations={conversations}/>}
            <div className={chatStyles.chatSection}>
                {currentConvo ? <ChatSection conversation={currentConvo} onReceive={handleReceive}/>:<p>Loading...</p>}
            </div>
        </div>
  );
}