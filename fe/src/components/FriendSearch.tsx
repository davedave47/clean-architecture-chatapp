import { useState, useRef, memo} from "react";
import { IUser } from "../interfaces";
import {useDebounce} from "../hooks/useDebounce";
import useFriend from "../hooks/useFriend";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import useSocket from "../hooks/useSocket";
import styles from '../styles/Friends.module.scss';
export default function FriendSearch(){
    const socket = useSocket();
    const currentUser = useSelector((state: RootState) => state.user);
    const result = useFriend();
    const prevSearch = useRef('');
    const {friends, setFriends} = result!;
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
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+`api/user?name=${search}`, {
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
    async function handleRemove(id: string){
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+`api/friend/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({friendId: id}),
            credentials: 'include'
        });
        if (response.ok) {
            setFriends(prevFriends => prevFriends!.filter(friend => friend.id !== id));
        }
    }
    async function handleAdd(id: string){
        if (!socket) return;
        socket.emit("request", id)
    }
    return (
        <div className={styles.search}>
            <input type="text" placeholder="Enter name or id" onChange={handleChange}/>
            <div className={styles.result}>
                {isSearching ? <p>Searching...</p> : <UserList users={users} friends={friends!} currentUser={currentUser.id!} onRemove={handleRemove} onAdd={handleAdd}/>}
            </div>
        </div>
    )
}

const UserList = memo(({ users, friends, currentUser, onRemove, onAdd }: {users: IUser[], friends: IUser[], currentUser: string, onRemove:(id: string)=>void, onAdd:(id:string)=>void}) => {
    return (
    <>
        {users.length > 0 ? users.map((user: IUser) => {
            if (user.id === currentUser) return (
                <div key={user.id} className={styles.items}>
                    <p>{user.username}</p>
                    <p>You</p>
                </div>
            )
            return (
                <div key={user.id} className={styles.items}>
                    <p>{user.username}</p>
                    {friends!.some(friend => friend.id === user.id) ? 
                    <button className={styles.remove} onClick={() => {onRemove(user.id)}}>Remove</button> :
                    <button className={styles.add} onClick={() => {onAdd(user.id)}}>Add</button>}
                </div>
            )
        }) : <p className={styles.error}>No users found</p>}
    </>
)});