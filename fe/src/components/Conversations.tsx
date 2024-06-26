import {useSelector, useDispatch} from 'react-redux';
import { RootState, AppDispatch } from '../redux';
import { IConversation } from '../interfaces';
import styles from '../styles/Coversations.module.scss';
import { fetchAllConvo, addConvo, removeConvo } from '../redux/convoSlice';
import { useEffect } from 'react';
import useSocket from '../hooks/useSocket';
export default function Conversations({onCreateConversation, onClick, selected}: {onCreateConversation: () => void, onClick: (conversation: IConversation) => void, selected: IConversation | null}) {
    console.log("conversations mounted")
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const onlineUsers = useSelector((state: RootState) => state.online);
    const socket = useSocket();
    const {convo: conversations, error} = useSelector((state: RootState) => state.convo);
    useEffect(() => {
        if (socket) {
            socket.on("convo", (conversation: IConversation) => {
                console.log("received", conversation)
                dispatch(addConvo(conversation));
                if (!selected) {
                    onClick(conversation);
                }
            })
            socket.on("convo removed", (conversation: IConversation) => {
                dispatch(removeConvo(conversation.id));
            })
        }
        return () => {
            if (socket) {
                console.log("convo listeners removed")
                socket.off("convo");
                socket.off("convo removed");
            }
        }
    },[socket, dispatch, selected, onClick])
    useEffect(() => {
        if (!conversations && !selected) {
            dispatch(fetchAllConvo()).then((data) => {
                if (data.payload) {
                    onClick(data.payload[0]);
                }
            })
        }
    },[dispatch, onClick, conversations, selected])
    function handleClick(conversation: IConversation) {
        onClick(conversation);
    }
    if (onlineUsers===null) {
        return <p>Loading...</p>
    }
    return (
        <div className={styles.container}>
            <div className={styles.buttons}>
                <button onClick={onCreateConversation}>Create new conversation</button>
            </div>
            <div className={styles.conversations}>
            {error ? <p>{error}</p> : conversations ? selected && conversations.map((conversation: IConversation) => {    
                const title = conversation.name || conversation.participants.filter(participant => participant.id !== user.id).map(participant => participant.username).join(', ');
                console.log("online Users", onlineUsers)
                const isOnline = onlineUsers ? conversation.participants.filter(participant => onlineUsers.map(user => user.id).includes(participant.id)).length+1 >= (conversation.participants.length+1) / 2:false;
                return (
                <div key={conversation.id} onClick={() => handleClick(conversation)} className={`${styles.conversation} ${selected!.id===conversation.id && styles.active}`}>
                    <div className={styles.info}>
                        <div>
                        <h3 className={styles.name}>{title}</h3>
                        {isOnline && <span className="online"></span>}
                        </div>
                        {conversation.lastMessage ?
                        <div className={styles.message}>
                            <span>{conversation.lastMessage.sender.username===user.username ? "You":conversation.lastMessage.sender.username}: </span>
                            <span>{conversation.lastMessage.content.file ? conversation.lastMessage.content.text.split('/').pop()?.replace(/-\d+$/, ''):conversation.lastMessage.content.text} - </span>
                            <span>{new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>:
                        <div className={styles.message}>
                            <span>No messages yet</span>
                        </div>
                        }
                    </div>
                </div>
            )
            })
            : <p>Loading...</p>
            }
            </div>
        </div>
    );
}