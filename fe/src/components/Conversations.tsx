import {useSelector} from 'react-redux';
import { RootState } from '../redux';
import { IConversation } from '../interfaces';
import styles from '../styles/Coversations.module.scss';
export default function Conversations({onCreateConversation, onClick, selected, conversations}: {onCreateConversation: () => void, onClick: (conversation: IConversation) => void, selected: IConversation | null, conversations: IConversation[]}) {
    console.log("conversations mounted")
    const user = useSelector((state: RootState) => state.user);

    function handleClick(conversation: IConversation) {
        onClick(conversation);
    }
    return (
        <div className={styles.container}>
            <div className={styles.buttons}>
                <button onClick={onCreateConversation}>Create new conversation</button>
            </div>
            <div className={styles.conversations}>
            {conversations && selected && conversations.map((conversation: IConversation) => {    
                const title = conversation.name || conversation.participants.filter(participant => participant.id !== user.id).map(participant => participant.username).join(', ');
                return (
                <div key={conversation.id} onClick={() => handleClick(conversation)} className={`${styles.conversation} ${selected.id===conversation.id && styles.active}`}>
                    <div className={styles.info}>
                        <h3 className={styles.name}>{title}</h3>
                        {conversation.lastMessage ?
                        <div className={styles.message}>
                            <span>{conversation.lastMessage.sender.username===user.username ? "You":conversation.lastMessage.sender.username}: </span>
                            <span>{conversation.lastMessage.content.text} - </span>
                            <span>{new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>:
                        <div className={styles.message}>
                            <span>No messages yet</span>
                        </div>
                        }
                    </div>
                </div>
            )
            })}
            </div>
        </div>
    );
}