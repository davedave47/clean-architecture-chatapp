import {useSelector, useDispatch} from 'react-redux';
import { removeRequest, acceptRequest, rejectRequest } from '../redux/requestSlice';
import useSocket from '../hooks/useSocket';
import { RootState, AppDispatch } from '../redux';
import { useState } from 'react';
import {IUser} from '../interfaces';
import styles from '../styles/Requests.module.scss';

export default function Requests({onCancel}: {onCancel: () => void}) {
    const {requests, loading, error} = useSelector((state: RootState) => state.request);
    const [showSent, setShowSent] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const socket = useSocket();

    function handleAccept(user: IUser) {
        if (!socket) return;
        socket.emit('accept', user.id);
        dispatch(acceptRequest(user));
    }
    function handleReject(user: IUser) {
        if (!socket) return;
        socket.emit('reject', user.id);
        dispatch(rejectRequest(user));
    }
    function handleRemove(user: IUser) {
        if (!socket) return;
        socket.emit('remove request', user.id);
        dispatch(removeRequest(user));
    }
    return (
        <div className={styles.container}>
            <div className={styles.buttons}>
                <button onClick={() => setShowSent(false)}>Received</button>
                <button onClick={() => setShowSent(true)}>Sent</button>
            </div>
            {error ? <p>{error}</p> : 
            loading? <p>Loading...</p>:
            requests ? 
            <div>
                {!showSent ? 
                    requests.received.map(request => (
                    <div className={styles.items}>
                        <p>{request.username}</p>
                        <button onClick={() => {handleAccept(request)}}>Accept</button>
                        <button onClick={() => {handleReject(request)}}>Reject</button>
                    </div>
                    ))
                :
                    requests.sent.map(request => (
                    <div className={styles.items}>
                        <p>{request.username}</p>
                        <button onClick={() => {handleRemove(request)}}>Remove</button>
                    </div>
                    ))
                }
            </div>
            :
            <p>No requests</p>}
        <button onClick={onCancel}>Cancel</button>
        </div>
    )
}