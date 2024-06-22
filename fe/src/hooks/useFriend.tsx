import { useContext } from "react";
import { FriendContext } from "../context/FriendContext";

export default function useFriend() {
    return useContext(FriendContext);
}