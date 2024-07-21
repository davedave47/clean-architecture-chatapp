import { useState, useRef} from "react";
import { IUser } from "../interfaces";
import {useDebounce} from "../hooks/useDebounce";
import { useSelector} from "react-redux";
import { RootState } from "../redux";
import useSocket from "../hooks/useSocket";
import styles from '../styles/Friends.module.scss';
export default function FriendSearch(){
    const prevSearch = useRef('');
    const [isSearching, setIsSearching] = useState(false);
    const [users, setUsers] = useState<IUser[]>([]);
    const [search, setSearch] = useDebounce('', async () => { 
        if (!search) {
            setUsers([]);
            return;
        }
        if (prevSearch.current === search) {
            return;
        }
        setIsSearching(true);
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+`/api/user?name=${search}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (response.ok) {
            const result = await response.json();
            setUsers(result);
            setIsSearching(false);
            prevSearch.current = search;
        }

        }, 400);
    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        setSearch(e.target.value);
    }
    return (
        <div className={styles.search}>
            <input type="text" placeholder="Enter name or id" onChange={handleChange}/>
            <div className={styles.result}>
                {isSearching ? <p>Searching...</p> : <UserList users={users}/>}
            </div>
        </div>
    )
}

const UserList = ({users}: {users: IUser[]}) => {
    const currentUser = useSelector((state: RootState) => state.user);
    const {friends} = useSelector((state: RootState) => state.friend);
    const {requests} = useSelector((state: RootState) => state.request);
    const online = useSelector((state: RootState) => state.online);
    console.log("request", requests)
    const socket = useSocket();
    function handleAdd(user: IUser){
        if (!socket) return;
        socket.emit("request", user)
    }
    function handleUnfriend(user: IUser){
        if (!socket) return;
        socket.emit("unfriend", user.id)
    }
    function handleCancel(user: IUser){
        if (!socket) return;
        socket.emit("remove request", user.id);
    }
    function handAccept(user: IUser){
        if (!socket) return;
        socket.emit('accept', user);
    }
    function handleReject(user: IUser){
        if (!socket) return;
        socket.emit('reject', user.id);
    }
    return (
    <>
        {users.length > 0 ? users.map((user: IUser) => {
            if (user.id === currentUser.id) return (
                <div key={user.id} className={styles.items}>
                    <p>{user.username}</p>
                    <p style={
                        {
                            marginLeft: 'auto',
                        }
                    }>You</p>
                </div>
            )
            return (
                <div key={user.id} className={styles.items}>
                    <p>{user.username}</p>
                    {friends!.some(friend => friend.id === user.id) ? 
                    <>
                        {online?.some(onlineUser => onlineUser.id === user.id) && <span className='online'></span>}
                        <button className={styles.remove} onClick={() => {handleUnfriend(user)}}>Unfriend</button>
                    </>:
                    requests?.sent.some(request => request.id === user.id) ? <button onClick={()=>{handleCancel(user)}}>Cancel Request</button> : 
                    requests?.received.some(request => request.id === user.id) ? <><button onClick={()=>{handAccept(user)}}>Accept</button><button onClick={()=>{handleReject(user)}}>Reject</button></> :
                    <button onClick={() => {handleAdd(user)}}>Request</button>
                    }
                </div>
            )
        }) : <p className={styles.error}>No users found</p>}
    </>
)};