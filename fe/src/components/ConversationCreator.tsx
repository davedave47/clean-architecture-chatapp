import useFriend from "../hooks/useFriend";
import { useState, useEffect } from "react";
import { IUser } from "../interfaces";
import styles from "../styles/Coversations.module.scss"
export function ConversationCreator({onCreate}: {onCreate: (participants: IUser[]) => void}) {
    const result = useFriend();
    const [uninvited, setUninvited] = useState<IUser[]|undefined>(undefined)
    const [participant, setParticipants] = useState<IUser[]>([])
    const [error, setError] = useState('')
    useEffect(()=> {
        if (!result) return;
        const {friends} = result;
        setUninvited(friends);
    }, [result])
    function handleCreate() {
        if (participant.length > 0) {
            onCreate(participant);
        }
        else {
            setError("Empty convo")
        }
    }
    if (!result) {
        return <p>Loading...</p>
    }
    return(
        <div className={styles.container}>
            <div className={styles.buttons}>
                <button onClick={handleCreate}>Create!</button>
            </div>
            <div className={styles.error}>
                {error}
            </div>
            <div className={styles.userContainer}>
                <div className={styles.users}>
                    <div className={styles.title}>Participants</div>
                    {participant && participant.map(user => {
                        return(
                            <div key={user.id} className={styles.item}>
                                <span>{user.username}</span>
                                <button onClick={()=>{
                                    setParticipants(prev => prev.filter(u => u.id !== user.id))
                                    setUninvited(prev => [user,...prev!])
                                }}>Remove</button>
                            </div>
                        )
                    })}
                </div>
                <div  className={styles.users}>
                    <div className={styles.title}>Friends</div>
                    {uninvited ? uninvited.map(user=>{
                    return (
                        <div key={user.id} className={styles.item}>
                            <span>{user.username}</span>
                            <button onClick={()=>{
                                setParticipants(prevParti => [...prevParti, user])
                                setUninvited(prev => prev?.filter(u => u.id !== user.id))
                            }}>Add</button>
                        </div>
                    )
                    }):<p>Loading</p>}
                </div>
            </div>
        </div>
    )

}