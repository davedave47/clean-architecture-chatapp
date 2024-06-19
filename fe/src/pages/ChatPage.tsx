
import { useNavigate } from "react-router-dom";
import { MouseEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logOut } from "../redux/userSlice";
import { SocketProvider } from "../context/SocketContext";
import ConversationSection from "../components/ConversationSection";
import { RootState } from "../redux";
import { useAuth } from "../hooks/useAth";
export default function ChatPage() {
    const nagivate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const result = useAuth()
    
    // const [data, loading, error] = useFetchData<IUser>("http://localhost:3000/api/user", {
    //     credentials: 'include'
    // });

    useEffect(() => {
        if (result) {
            dispatch(setUser(result));
        }
        console.log("chat page mounted")
    }, [result, dispatch]);
    if (!result) {
        return <p>Loading...</p>
    } 

    async function handleSubmit(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const response = await fetch('http://localhost:3000/api/logout', {
            method: 'POST',
            credentials: 'include'
        });        
        if (response.ok) {
            dispatch(logOut())
            nagivate('/login');
        }
    }

    return (
        <SocketProvider>
            <div>
                <div>Welcome {user.username}</div>
                <ConversationSection />
                <button onClick={handleSubmit}>Log out</button>
            </div>
        </SocketProvider>

    )
}