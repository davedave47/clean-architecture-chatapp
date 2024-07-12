import { createContext, useEffect, useState, ReactNode } from 'react';
class Socket {
  private socket: WebSocket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventListeners: { [event: string]: ((data: any) => void) } = {};
  constructor(url: string) {
    this.socket = new WebSocket(url);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (data: any) => void) {
    if (event==="connect") {
      this.socket.onopen = () => {
        callback(null);
      }
      this.socket.onmessage = (data) => {
        const { event, data: eventData } = JSON.parse(data.data);
        if (this.eventListeners[event]) {
          this.eventListeners[event](eventData);
        }
      }
      return;
    }
    this.eventListeners[event] = (callback);
  }
  off(event: string) {
    delete this.eventListeners[event];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, data: any) {
    this.socket.send(JSON.stringify({ event, data }));
  }
  disconnect() {
    this.socket.close();
  }
}

export const SocketContext = createContext<Socket | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode}) {
  const [socket, setSocket] = useState<Socket | undefined>();
  useEffect(() => {
    const newSocket = new Socket('ws://localhost:3000');
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
