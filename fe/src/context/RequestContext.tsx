import {createContext, useMemo, useState, useEffect} from 'react';
import {IUser} from "../interfaces";
import useFetchData from '../hooks/useFetchData';

export const SentRequestContext = createContext<{sent: IUser[] | undefined, setSent: React.Dispatch<React.SetStateAction<IUser[] | undefined>> | undefined}>({sent: undefined, setSent: undefined});
export const ReceivedRequestContext = createContext<{received: IUser[] | undefined, setReceived: React.Dispatch<React.SetStateAction<IUser[] | undefined>> | undefined}>({received: undefined, setReceived: undefined});

export function RequestProvider({children}: {children: React.ReactNode}) {
    const [sent, setSent] = useState<IUser[] | undefined>(undefined);
    const [received, setReceived] = useState<IUser[] | undefined>(undefined);
    const url = `api/friend`;
    const option: RequestInit = useMemo(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }),[]);
    const [data, loading, error] = useFetchData<{sent: IUser[], received: IUser[]}>(url, option);
    useEffect(() => {
        if (data) {
            setSent(data.sent);
            setReceived(data.received);
        }
    }, [data, loading, error]);
    return (
        <SentRequestContext.Provider value={{sent, setSent}}>
            <ReceivedRequestContext.Provider value={{received, setReceived}}>
                {children}
            </ReceivedRequestContext.Provider>
        </SentRequestContext.Provider>
    );
}