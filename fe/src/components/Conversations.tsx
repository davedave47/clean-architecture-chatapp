import {useSelector} from 'react-redux';
import { RootState } from '../redux';
import { IConversation } from '../interfaces';
import { useEffect, useMemo } from 'react';
import useFetchData from '../hooks/useFetchData';
export default function Conversations({onCreateConversation, onClick, selected}: {onCreateConversation: () => void, onClick: (conversation: IConversation) => void, selected: IConversation | null}) {
    console.log("conversations mounted")
    const user = useSelector((state: RootState) => state.user);
    const uri = 'http://localhost:3000/api/conversation';
    const option: RequestInit = useMemo(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }),[]);
    const [conversations, loading, error] = useFetchData<IConversation[]>(uri, option);
    useEffect(() => {
        if (conversations && conversations.length > 0 && !selected) {
            onClick(conversations[0]);
        }
    }, [conversations, onClick, selected]);
    if (loading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>Error: {error.message}</p>;
    }
    function handleClick(conversation: IConversation) {
        onClick(conversation);
    }
    return (
        <div>
            <button onClick={onCreateConversation}>Create new conversation</button>
            <div style={
                {
                    display: 'flex',
                    flexDirection: 'column',
                }
            }>
            {conversations && selected && conversations.map((conversation: IConversation) => {    
                const title = conversation.name || conversation.participants.filter(participant => participant.id !== user.id)[0].username;
                return (
                <div key={conversation.id} onClick={() => handleClick(conversation)} style={
                    {
                        boxSizing: 'border-box',
                        border: selected.id === conversation.id ? '1px solid black' : 'none',
                        padding: '10px',
                        cursor: 'pointer',
                    }
                }>
                    <h3>{title}</h3>
                    {conversation.messages.length > 0 &&
                    <div>
                        <p>{conversation.messages[0].content.text}</p>
                        <p>{conversation.messages[0].createdAt}</p>
                    </div>
                    }
                </div>
            )
            })}
            </div>
        </div>
    );
}