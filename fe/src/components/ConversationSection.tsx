import Conversations from "./Conversations";
import ChatSection from "./ChatSection";
import {useState, useCallback, useEffect} from 'react';
import { IConversation } from "../interfaces";
import useSocket from "../hooks/useSocket";
export default function ConversationSection() {
    console.log("conversation section mounted")
    const socket = useSocket();
    useEffect(() => {
        console.log(socket?.id)
        socket?.emit("login")
    },[socket])

    const [currentConvo, setCurrentConvo] = useState<IConversation|null>(null);
    const handleClick = useCallback(( conversation: IConversation) => {
        setCurrentConvo(conversation);
    },[])
    function handlecreateConversation() {
        alert('create conversation');
    }
    return (
        <div>
            <Conversations onCreateConversation={handlecreateConversation} onClick={handleClick}  selected={currentConvo}/>
            {currentConvo && <ChatSection conversation={currentConvo} />}
        </div>
  );
}