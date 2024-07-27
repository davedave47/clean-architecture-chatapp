import { createContext, useEffect, useState, ReactNode } from "react";
import {useDispatch} from 'react-redux';
import { useNavigate } from "react-router-dom";
import { IUser } from "@/interfaces";
import { removeFriend, addFriend } from '@/redux/friendSlice';
import { removeRequest, acceptRequest, rejectRequest, receiveRequest, sendRequest } from '@/redux/requestSlice';
import { logOut } from "@/redux/userSlice";
import { setOnline, loggedOn, loggedOff } from '@/redux/onlineSlice';
class Socket {
  private socket: WebSocket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventListeners: { [event: string]: (data: any) => void } = {};
  constructor(url: string) {
    this.socket = new WebSocket(url);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (data: any) => void) {
    if (event === "connect") {
      this.socket.onopen = () => {
        callback(null);
      };
      this.socket.onmessage = (data) => {
        const { event, data: eventData } = JSON.parse(data.data);
        if (this.eventListeners[event]) {
          console.log("Received event", event, eventData);
          this.eventListeners[event](eventData);
        } else {
          console.log("No listener for event", event);
        }
      };
      return;
    }
    this.eventListeners[event] = callback;
  }
  off(event: string) {
    delete this.eventListeners[event];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, data: any) {
    console.log("emitting", event, data);
    this.socket.send(JSON.stringify({ event, data }));
  }
  disconnect() {
    this.socket.close();
  }
}

export const SocketContext = createContext<Socket | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | undefined>();
  const dispatch = useDispatch();
  const nagivate = useNavigate();
  useEffect(() => {
    const newSocket = new Socket(
      import.meta.env.VITE_BACKEND_URL.toString().replace("http", "ws") + "/ws"
    );
    newSocket.on("connect", () => {
      setSocket(newSocket);
      console.log("socket connected");
      newSocket.on("authentication error", () => {
        console.log("authentication error");
        dispatch(logOut());
        nagivate("/login");
      });
      newSocket.on("friend request", (user: IUser) => {
        dispatch(receiveRequest(user));
      });
      newSocket.on("friend accepted", (user: IUser) => {
        dispatch(removeRequest(user));
        dispatch(addFriend(user));
        dispatch(loggedOn(user));
      });
      newSocket.on("friend rejected", (user: IUser) => {
        console.log("friend rejected", user);
        dispatch(removeRequest(user));
      });
      newSocket.on("unfriended", (user) => {
        dispatch(removeFriend(user.id));
      });
      newSocket.on("online", (online) => {
        console.log("received online", online);
        dispatch(setOnline(online));
        newSocket.off("online");
      });
      newSocket.on("user logged on", (user) => {
        console.log("user logged on", user);
        dispatch(loggedOn(user));
      });
      newSocket.on("user logged out", (user) => {
        console.log("user logged out", user);
        dispatch(loggedOff(user));
      });
      newSocket.on("accept", (user) => {
        dispatch(acceptRequest(user));
      })
      newSocket.on("reject", (user) => {
        dispatch(rejectRequest(user));
      })
      newSocket.on("request", (user) => {
        dispatch(sendRequest(user));
      })
    });
    return () => {
      newSocket.disconnect();
      newSocket.off("friend request");
      newSocket.off("friend accepted");
      newSocket.off("friend rejected");
      newSocket.off("unfriended");
      newSocket.off("user logged on");
      newSocket.off("user logged out");
      newSocket.off("accept");
      newSocket.off("reject");
      newSocket.off("request");
      console.log("socket disconnected");
    };
  }, [dispatch, nagivate]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
