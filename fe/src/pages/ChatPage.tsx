import { useNavigate } from "react-router-dom";
import { MouseEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../redux/userSlice";
import ConversationSection from "../components/ConversationSection";
import { RootState, AppDispatch } from "../redux";
import { useAuth } from "../hooks/useAuth";
import Friends from "../components/Friends";
import useSocket from "../hooks/useSocket";
import Requests from "../components/Requests";
import { fetchAllRequests } from "../redux/requestSlice";

export default function ChatPage() {
  const nagivate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user);
  const [showFriends, setShowFriends] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const { result, loading } = useAuth();
  const socket = useSocket();
  useEffect(() => {
    dispatch(fetchAllRequests());
  }, [dispatch]);
  useEffect(() => {
    if (!result && !loading) {
      nagivate("/login");
    }
  }, [result, dispatch, loading, nagivate]);
  async function handleSubmit(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/api/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (response.ok) {
      dispatch(logOut());
      nagivate("/login");
    }
  }

  if (loading || !socket) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100vw",
          padding: "10px",
        }}
      >
        <span>Welcome {currentUser.username}</span>
        <span>
          <button
            onClick={() => {
              setShowRequests(!showRequests);
            }}
          >
            Requests
          </button>
          {showRequests && (
            <Requests
              onCancel={() => {
                setShowRequests(false);
              }}
            />
          )}
        </span>
        <button
          onClick={() => {
            setShowFriends(true);
          }}
        >
          Friends
        </button>
        <button onClick={handleSubmit}>Log out</button>
      </div>
      {showFriends && <Friends onCancel={() => setShowFriends(false)} />}
      <ConversationSection />
    </div>
  );
}
