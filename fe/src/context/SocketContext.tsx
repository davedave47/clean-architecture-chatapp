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
        else {
          console.log("No listener for event", event);
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
    const newSocket = new Socket(import.meta.env.VITE_BACKEND_URL.toString().replace('http', 'ws')+"/ws");
    newSocket.on('connect', () => {
      setSocket(newSocket);
      console.log("socket connected")
    });
    return () => {
      newSocket.disconnect();
      console.log("socket disconnected")
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
