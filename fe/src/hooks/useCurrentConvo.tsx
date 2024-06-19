import { useContext } from "react";
import { ConversationContext } from "../context/currentConvoContext";

export default function useCurrentConvo() {
    return useContext(ConversationContext);
}