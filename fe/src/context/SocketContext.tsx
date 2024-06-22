import { createContext, useEffect, useState, ReactNode } from 'react';
import io, {Socket} from 'socket.io-client';

export const SocketContext = createContext<Socket | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode}) {
  const [socket, setSocket] = useState<Socket | undefined>();
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });
    newSocket.on('connect', () => {
      setSocket(newSocket);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}