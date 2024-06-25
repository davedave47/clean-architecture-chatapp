
import { useNavigate } from "react-router-dom";
import { MouseEvent, useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../redux/userSlice";
import ConversationSection from "../components/ConversationSection";
import { RootState } from "../redux";
import { useAuth } from "../hooks/useAuth";
import Friends from "../components/Friends";
import useSocket from "../hooks/useSocket";
import Requests from "../components/Requests";
import { IUser } from "../interfaces";
import { removeFriend, addFriend } from '../redux/friendSlice';
import { removeRequest, receiveRequest } from '../redux/requestSlice';
import { setOnline, loggedOn, loggedOff } from '../redux/onlineSlice';


export default function ChatPage() {
    const nagivate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.user);
    const [showFriends, setShowFriends] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const {result, loading} = useAuth()
    const socket = useSocket()
    useEffect(() => {
        if (!result&&!loading) {
            nagivate('/login');
        }
    }, [result, dispatch, loading, nagivate]);
    useEffect(()=>{
        if (socket) {
            console.log("emitting login", socket)
            socket.emit("login")
            socket.on('authentication error', () => {
                console.log("authentication error")
                dispatch(logOut());
                nagivate('/login');
            })
            socket.on('friend request', (user: IUser) => {
                dispatch(receiveRequest(user));
            })
            socket.on('friend accepted', (user: IUser) => {
                dispatch(removeRequest(user));
                dispatch(addFriend(user));
            })
            socket.on('friend rejected', (user: IUser) => {
                console.log("friend rejected", user)
                dispatch(removeRequest(user));
            })
            socket.on('unfriended', (user) => {
                dispatch(removeFriend(user.id));
            })
            socket.on('online', (online) => {
                console.log("received online", online)
                dispatch(setOnline(online));
            })
            socket.on('user logged on', (user) => {
                console.log("user logged on", user)
                dispatch(loggedOn(user));
            })
            socket.on('user logged out', (user) => {
                console.log("user logged out", user)
                dispatch(loggedOff(user));
            })
        }
        return () => {
            if (socket) {
                socket.off('friend request');
                socket.off('friend accepted');
                socket.off('friend rejected');
                socket.off('unfriended');
                socket.off('online');
                socket.off('user logged on');
                socket.off('user logged out');
            }
        }
    },[socket,dispatch,nagivate])
    async function handleSubmit(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/api/logout', {
            method: 'POST',
            credentials: 'include'
        });        
        if (response.ok) {
            dispatch(logOut())
            nagivate('/login');
        }
    }

    if (loading||!socket)  {
        return <div>Loading...</div>
    }

    return (
            <div style = {
                {
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    width: '100vw',
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            
            }>
                <div style={
                    {
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '20%',
                        padding: '10px',
                    }
                
                }>
                    <span>Welcome {currentUser.username}</span>
                    <button onClick={()=>{setShowRequests(!showRequests)}}>Requests</button>
                    {showRequests && <Requests onCancel={()=>{setShowRequests(false)}}/>}
                    <button onClick={()=>{setShowFriends(true)}}>Friends</button>
                    <button onClick={handleSubmit}>Log out</button>
                </div>
                    {showFriends && <Friends onCancel={() => setShowFriends(false)} />}
                    <ConversationSection/>
            </div>
    )
}