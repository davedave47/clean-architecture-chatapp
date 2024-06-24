import { useState, useEffect } from "react";
import { IUser } from "../interfaces";
import styles from "../styles/Coversations.module.scss"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux";
import { fetchAllFriends } from "../redux/friendSlice";
export function ConversationCreator({onCancel, onCreate}: {onCancel: () => void, onCreate: (participants: IUser[]) => void}) {
    const {friends, error: e} = useSelector((state: RootState) => state.friend);
    const dispatch = useDispatch<AppDispatch>();
    const [uninvited, setUninvited] = useState<IUser[]>([])
    const [participant, setParticipants] = useState<IUser[]>([])
    const [error, setError] = useState('')
    useEffect(()=> {
        if (friends) {
            setUninvited(friends)
        }
        else {
            dispatch(fetchAllFriends()).then((data) => {
                if (data.payload) {
                    setUninvited(data.payload)
                }
            })
        }
    }, [dispatch, friends])
    function handleCreate() {
        if (participant.length > 0) {
            onCreate(participant);
        }
        else {
            setError("Empty convo")
        }
    }
    function handleClear() {
        if (!friends) {
            return;
        }
        setParticipants([]);
        setUninvited(friends);
    }
    return(
        <div className={styles.container}>
            <div className={styles.buttons}>
                <button onClick={handleClear}>Clear</button>
                <button onClick={handleCreate}>Create!</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
            <div className={styles.error}>
                {error}
            </div>
            {e ? <p>{e}</p> : friends ?
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
            </div>:
            <p>Loading...</p>
        }
        </div>
    )

}