import Peer from "simple-peer";
import { useEffect, useRef } from "react";
import { IConversation } from "@/interfaces";
import useSocket from "@/hooks/useSocket";
const DuringCall = ({peer, stream, conversation, onLeave}: {peer: Peer.Instance, stream:MediaStream, conversation: IConversation, onLeave: () => void}) => {
    const myVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideos = useRef<HTMLDivElement | null>(null);
    const socket = useSocket();
    //const connectionsRef = useRef<Peer.Instance[]>([]);
    useEffect(() => {
        if (!myVideo.current || !remoteVideos.current|| !socket) {
            return;
        }
        socket.off("callAccepted");
        socket.off("callConvo");
        socket.on("callAccepted", data => {
            console.log("call accepted by", data.from)
            peer.signal(data.signal);
        })
        myVideo.current.srcObject = stream;
        peer.on("stream", stream => {
            const div = document.createElement("div");
            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            div.appendChild(video);
            remoteVideos.current?.appendChild(div);
        });
        peer.on("close", () => {
            onLeave();
            peer.destroy();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[conversation, peer, stream, socket]);
    
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
            <div>
            <video ref={myVideo} autoPlay playsInline muted style={{width: "100%", height: "100%"}}></video>
            <p>ME</p>
            </div>
            <div ref={remoteVideos}></div>
            <button onClick={onLeave}>Leave</button>
        </div>
    )
}

export default DuringCall;