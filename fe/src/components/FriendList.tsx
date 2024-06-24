import styles from '../styles/Friends.module.scss';
import { RootState, AppDispatch } from '../redux';
import {useSelector, useDispatch} from 'react-redux';
import { useEffect } from 'react';
import { fetchAllFriends, removeFriend } from '../redux/friendSlice';
import useSocket from '../hooks/useSocket';
export default function FriendList() {
    const {friends, error} = useSelector((state: RootState) => state.friend);
    const dispatch = useDispatch<AppDispatch>();
    const socket = useSocket();
    useEffect(() => {
        if (socket) {
            socket.on('unfriended', (id: string) => {
                dispatch(removeFriend(id));
            })
        }
        return () => {
            if (socket) {
                socket.off('unfriended');
            }
        }
    },[socket, dispatch])
    useEffect(() => {
        if (!friends) {
            dispatch(fetchAllFriends());
        }
    }, [friends, dispatch])
    function handleRemove(id: string) {
        if (friends) {
            socket!.emit('unfriend', id)
            dispatch(removeFriend(id))
        }
    }
    return (
        <div className={styles.friendlist}>
            <p>Friends</p>
            {error ? <p>{error}</p> : friends ? friends.map((user) => {
                return (
                    <div key={user.id} className={styles.items}>
                        {user.username}
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