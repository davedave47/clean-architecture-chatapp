import { createContext, useState, ReactNode, Dispatch, SetStateAction, useMemo, useEffect } from 'react';
import { IUser } from "../interfaces";
import useFetchData from "../hooks/useFetchData";

// Define a new type for the context
type FriendContextType = {
  friends: IUser[] | undefined;
  setFriends: Dispatch<SetStateAction<IUser[] | undefined>>;
};

// Create the context
export const FriendContext = createContext<FriendContextType | undefined>(undefined);

// Create the provider
export function FriendProvider({ children }: { children: ReactNode }) {
    const [friends, setFriends] = useState<IUser[] | undefined>(undefined);
    const url = `api/friend`;
    const option: RequestInit = useMemo(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }),[]);
    const [data, loading, error] = useFetchData<IUser[]>(url, option);
    useEffect(() => {
        if (data) {
            setFriends(data);
        }
    }, [data, loading, error]);
    return (
        <FriendContext.Provider value={{friends, setFriends}}>
            {children}
        </FriendContext.Provider>
    );
}