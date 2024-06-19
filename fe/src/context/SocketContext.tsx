import { createContext, useEffect, useRef, ReactNode } from 'react';
import io, {Socket} from 'socket.io-client';

export const SocketContext = createContext<Socket | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode}) {
  const socket = useRef<Socket|undefined>();
  useEffect(() => {
    socket.current = io("http://localhost:3000", { withCredentials: true });
    return () => {
      if (socket.current)
      socket.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket.current!}>
      {children}
    </SocketContext.Provider>
  );
}
