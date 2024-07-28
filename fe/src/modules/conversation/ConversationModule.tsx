import Conversations from "@/components/conversation/Conversations";
import ChatSection from "@/modules/chat/ChatSection";
import { ConversationCreator } from "@/components/conversation/ConversationCreator";
import {useState} from 'react';
import { IConversation, IUser } from "@/interfaces";
import useSocket from "@/hooks/useSocket";
import chatStyles from '@/styles/ChatSection.module.scss';
export default function ConversationModule() {
    console.log("conversation section mounted")
    const [currentConvo, setCurrentConvo] = useState<IConversation | null>(null);    
    const [isCreating, setIsCreating] = useState(false);
    const socket = useSocket();
    const handleClick = (conversation: IConversation) => {
        setCurrentConvo(conversation);
    }
    async function handlecreateConversation(participants: IUser[]) {
        console.log("emitting create convo", socket)
        socket?.emit("create convo", participants)
        setIsCreating(false)
    }
    return (
        <div style={
            {
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '80%'
            }
        }>  {isCreating ? <ConversationCreator onCancel={()=>{setIsCreating(false)}} onCreate={handlecreateConversation}/>:
            <Conversations onCreateConversation={()=>{setIsCreating(true)}} onClick={handleClick}  selected={currentConvo}/>}
            <div className={chatStyles.chatSection}>
                {currentConvo ? <ChatSection conversation={currentConvo} key={currentConvo.id}/>:<p>Loading...</p>}
            </div>
        </div>
  );
}