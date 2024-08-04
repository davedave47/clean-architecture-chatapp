import Peer from 'simple-peer';
import { useState, useEffect } from 'react';
import useSocket from '@/hooks/useSocket';
import { IConversation } from '@/interfaces';
import DuringCall from './DuringCall';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux';

function Calling({conversation, video, onCancel}: {conversation: IConversation, video: boolean, onCancel: () => void}) {
    const socket = useSocket();
    const [calling, setCalling] = useState(true);
    const [call, setCall] = useState<{peer: Peer.Instance, mystream: MediaStream, callerstream: MediaStream[]} | null>(null);
    const user = useSelector((state: RootState) => state.user);
    useEffect(() => {
        if (!socket) {
            return;
        }
        navigator.mediaDevices.getUserMedia({video, audio: true}).then(stream => {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream,
            });
            peer.on("signal", data => {
                socket.emit("callConvo", {conversation, signalData: data, video});
            });
            peer.on("stream", callerstream => {
                setCall(prev => {
                    if (prev) {
                        prev.callerstream.push(callerstream);
                        return prev;
                    }
                    return {peer, mystream: stream, callerstream: [callerstream]};
                });
            })
            socket.on("callAccepted", data => {
                console.log("call accepted by", data.signalData)
                setCalling(false);
                peer.signal(data.signalData);
            });
        })
        return () => {
            socket.off("callAccepted");
        }
    },[socket, conversation, video]);

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
                    <DuringCall peer={call.peer} mystream={call.mystream} callerstream={call.callerstream} conversation={conversation} onLeave={onCancel}/>
                    : 
                    <div>Loading...</div>
            }
        </>
    )
}

export default Calling;
