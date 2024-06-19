import {useEffect, useState} from 'react'
import { IUser } from '../interfaces';
export function useAuth() {
    const [user, setUser] = useState<IUser|null>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                const result = await response.json();
                setUser(result)
            } catch (error) {
                if (error instanceof Error)
                console.log(error);
            }
        };
        fetchData();
    }, []);
    return user;
}