import Peer from "simple-peer";
import { useEffect, useRef } from "react";
import { IConversation } from "@/interfaces";
import useSocket from "@/hooks/useSocket";
const DuringCall = ({peer, mystream, callerstream, conversation, onLeave}: {peer: Peer.Instance, mystream:MediaStream, callerstream: MediaStream[], conversation: IConversation, onLeave: () => void}) => {
    const myVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideos = useRef<(HTMLVideoElement | null)[]>([]);
    const socket = useSocket();
    //const connectionsRef = useRef<Peer.Instance[]>([]);
    useEffect(() => {
        if (myVideo.current) {
            myVideo.current.srcObject = mystream;
        }
        callerstream.forEach((stream, index) => {
            if (!remoteVideos.current[index]) return;
            remoteVideos.current[index].srcObject = stream;
        });
    }, [mystream, callerstream]);

    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.off("callConvo");   
        peer.on("close", () => {
            onLeave();
            peer.destroy();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[conversation, peer, socket]);
    
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
                padding: '10px 0',
            }
        }>
            <div style={{width: "100%", flex: 1, position: "relative"}}>
                <video ref={myVideo} autoPlay playsInline muted style={{width: "100%", height: "100%"} }>
                </video>
                <p style={{position: "absolute", left: "0px", bottom: "0px"}}>ME</p>
            </div>
            {callerstream.map((_, index) => (
                <div key={index} style={{width: "100%", flex: 1, position: "relative"}}>
                    <video ref={el => remoteVideos.current[index] = el} autoPlay playsInline style={{width: "100%", height: "100%"}}>
                    </video>
                    <p style={{position: "absolute", left: "0px", bottom: "0px"}}>THEM {index + 1}</p>
                </div>
            ))}
            <button style={{flex: 0.1, padding: 0, marginTop: "5%", width: "50%", alignSelf: "center"}} onClick={onLeave}>Leave</button>
        </div>
    )
}

export default DuringCall;