import { useSelector } from "react-redux";
import { RootState } from "@/redux";
import { IConversation } from "@/interfaces";
import Peer from "simple-peer";
import useSocket from "@/hooks/useSocket";
import { useState } from "react";
import DuringCall from "./DuringCall";
const IncomingCall = ({conversation, callerId, signalData, onReject}: {conversation: IConversation, callerId: string, signalData: Peer.SignalData, onReject: ()=>void}) => {
    const user = useSelector((state: RootState) => state.user);
    const [call, setCall] = useState<{peer: Peer.Instance, stream: MediaStream} | null>(null);
    const socket = useSocket();
    const handleReject = () => {
        onReject();
    };
    const handleAccept = () => {
        if (!socket) return;
        navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(stream => {
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream,
            });
            peer.on("signal", data => {
                console.log("sending signal")
                socket.emit("acceptCall", {signalData: data, conversation: conversation});
            });
            peer.signal(signalData);
            setCall({peer, stream});
        });
    };
    if (!call)
    return (
        <div style={
            {
                position: 'fixed',
                top: '10%',
                left: '10%',
                width: '30vw',
                height: '80vh',
                backgroundColor: 'black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                zIndex: 100,
                borderRadius: '5%',
                color: 'white',
            }
        }>
            <div style={
                {
                    alignSelf: 'center',
                    fontWeight: 'bold',
                    textAlign: 'center',
                }
            }>
            <p>{conversation.participants.length > 2 && (conversation.name || conversation.participants.filter(participant => participant.id !== user.id).map(participant => participant.username).join(', '))}</p>
            <p>Incoming call</p>
            <p style={
                {
                    fontSize: '4em',
                }
            }>{conversation.participants.find(participant => participant.id === callerId)?.username}</p>
            </div> 
            <div style={
                {
                    display: 'flex',
                    justifyContent: 'space-around',
                    height: '10%',
                }
            }>
            <button style={
                            {
                                width: '30%',
                                height: '100%',
                                backgroundColor: 'green',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                alignSelf: 'center',
                            }
                        } onClick={handleAccept}>Accept</button>
            <button style={
                            {
                                width: '30%',
                                height: '100%',
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                alignSelf: 'center',
                            }
                        } onClick={handleReject}>Reject</button>
            </div>
        </div>
    );
    return (
        <DuringCall peer={call.peer} stream={call.stream} conversation={conversation} onLeave={onReject}/>
    )
}

export default IncomingCall;