import { useDispatch} from "react-redux";
import { setUser } from "../redux/userSlice";
import {useEffect, useState} from 'react'
export function useAuth() {
    const dispatch = useDispatch();
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_BACKEND_URL+'api/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                if (response.ok) {
                    const result = await response.json();
                    dispatch(setUser(result));
                    setSuccess(true);
                }
            } catch (error) {
                if (error instanceof Error)
                console.log(error);
            }
            finally{
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch]);
    return {result: success, loading}
}