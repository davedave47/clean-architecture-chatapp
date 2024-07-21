import styles from '../styles/Friends.module.scss';
import { RootState, AppDispatch } from '../redux';
import {useSelector, useDispatch} from 'react-redux';
import { useEffect } from 'react';
import { fetchAllFriends} from '../redux/friendSlice';
import useSocket from '../hooks/useSocket';
export default function FriendList() {
    const {friends, error} = useSelector((state: RootState) => state.friend);
    const onlineUsers = useSelector((state: RootState) => state.online);
    const dispatch = useDispatch<AppDispatch>();
    const socket = useSocket();
    useEffect(() => {
        if (!friends) {
            dispatch(fetchAllFriends());
        }
    }, [friends, dispatch])
    function handleRemove(id: string) {
        if (friends) {
            socket!.emit('unfriend', id)
        }
    }
    return (
        <div className={styles.friendlist}>
            <p>Friends</p>
            {error ? <p>{error}</p> : friends ? friends.map((user) => {
                const isOnline = onlineUsers ? onlineUsers.map(user => user.id).includes(user.id):false;
                return (
                    <div key={user.id} className={styles.items}>
                        <span>
                            {user.username}
                            {isOnline && <span className='online'></span>}
                        </span>
                        <button className={styles.remove} onClick={() => {handleRemove(user.id)}}>Remove friend</button>
                    </div>
                )
            }): <p style={
                {
                    border: 'none'
                }
            }>Loading...</p>}
        </div>
    )
}