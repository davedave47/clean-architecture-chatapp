import { SentRequestContext, ReceivedRequestContext } from "../context/RequestContext";
import { useContext } from "react";
export default function useRequest() {
    const {sent, setSent} = useContext(SentRequestContext);
    const {received, setReceived} = useContext(ReceivedRequestContext);
    return {sent, setSent, received, setReceived};
}