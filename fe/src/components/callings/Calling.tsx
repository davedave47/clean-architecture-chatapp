import Peer from 'simple-peer';
import { useState, useEffect } from 'react';
import useSocket from '@/hooks/useSocket';
import { IConversation } from '@/interfaces';
import DuringCall from './DuringCall';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux';

function Calling({conversation, video, audio, onCancel}: {conversation: IConversation, video: boolean, audio: boolean, onCancel: () => void}) {
    const socket = useSocket();
    const [calling, setCalling] = useState(true);
    const [call, setCall] = useState<{peer: Peer.Instance, stream: MediaStream} | null>(null);
    const user = useSelector((state: RootState) => state.user);
    useEffect(() => {
        if (!socket) {
            return;
        }
        navigator.mediaDevices.getUserMedia({video: false, audio}).then(stream => {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream,
            });
            peer.on("signal", data => {
                socket.emit("callConvo", {conversation, signalData: data});
            });
            socket.on("callAccepted", data => {
                console.log("call accepted", data.from)
                setCalling(false);
                peer.signal(data.signalData);
            });
            setCall({peer, stream});
        })
        return () => {
            socket.off("callAccepted");
        }
    },[socket, conversation, video, audio]);

    return (
        <>
            {
                calling ?   
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
                        }
                    }>
                        <div style={
                            {
                                alignSelf: 'center',
                                fontWeight: 'bold',
                            }
                        }>
                            <p style={
                                {
                                    color: 'white',
                                    textAlign: 'center',
                                }
                            }>Calling</p>
                            <p style={
                                {
                                    color: 'white',
                                    fontSize: '5em',
                                }
                            }>{conversation.name || conversation.participants.filter(participant => participant.id !== user.id).map(participant => participant.username).join(', ')}</p>
                        </div>
                        <button style={
                            {
                                width: '50%',
                                height: '10%',
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                alignSelf: 'center',
                            }
                        } onClick={onCancel}>Cancel</button>
                    </div>
                    : 
                    call ?
                    <DuringCall peer={call.peer} stream={call.stream} conversation={conversation} onLeave={onCancel}/>
                    : 
                    <div>Loading...</div>
            }
        </>
    )
}

export default Calling;
