import { IMessage, IConversation } from "@/interfaces";
import Message from "@/components/chat/Message";
import ChatSubmit from "@/components/chat/ChatSubmit";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState, useMemo, useRef } from "react";
import useFetchData from "@/hooks/useFetchData";
import styles from '@/styles/ChatSection.module.scss';
import {useDispatch} from 'react-redux';
import { setLatestMessage } from "@/redux/convoSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faPlus } from "@fortawesome/free-solid-svg-icons";
// import * as brotliPromise from 'brotli-wasm';

export default function ChatSection({conversation}: {conversation: IConversation}) {
    const dispatch = useDispatch();
    const socket = useSocket();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const canScroll = useRef(true);
    const skip = useRef(0);
    const fetchedAll = useRef(false);
    const url = `/api/conversation/messages`;
    const option: RequestInit = useMemo(() => ({
        method: 'POST',
        body: JSON.stringify({conversationId: conversation.id, amount: 20, skip: 0}),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }),[conversation.id]);
    const [data, loading, error] = useFetchData<IMessage[]>(url,option);
    useEffect(() => {
        if (!data) {
            return;
        }
        setMessages(data);
        skip.current = 20;
        return () => {
            skip.current = 0;
            canScroll.current = true;
            fetchedAll.current = false;
            setMessages([]);
        }
    }, [data]);
    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.on('chat message', (message: IMessage) => {
            if (message.conversationId === conversation.id) {
                setMessages(prevMessages => [...prevMessages, message]);
                canScroll.current = true;
            }
            dispatch(setLatestMessage(message))
            skip.current += 1;
        });
        console.log("chat message listener added")
        return () => {
            socket.off('chat message');
            console.log("chat message listener removed")
        }
    }, [socket, conversation.id, dispatch]);

    useEffect(() => {
        if (messagesEndRef.current&&canScroll.current) {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'instant' })
            }
        }
        
    }, [messages]);
    function handleSend(message: string, files?: FileList) {
        if (!socket) {
            return;
        }
        const sendTextMessage = () => {
            if (message === "") {
                return;
            }
            socket.emit('chat message', {content: {text: message, file: false}, conversationId: conversation.id, createdAt: new Date()});
        }
        if (files) {
            console.log('files: ', files)
            const formData = new FormData();
            // const compressedPromise = Array.from(files).map((file) => {
            //     return new Promise<void>( (resolve, reject)=> {
            //     const filetype = file.type.split('/')[0];
            //     if (filetype === 'image' || filetype === 'video'|| filetype === 'audio') {
            //         formData.append('files', file);
            //         resolve();
            //         return;
            //     }
            //     const reader = new FileReader();
            //     reader.onload = async (event) => {
            //         if (event.target?.result) {
            //             try {
            //                 console.log("compressing file", file.name)
            //                 const brotli = await brotliPromise.default;
            //                 const arrayBuffer = event.target.result as ArrayBuffer;
            //                 const compressed = brotli.compress(new Uint8Array(arrayBuffer), { quality: 1 });
            //                 const blob = new Blob([compressed], { type: file.type });
            //                 formData.append('files', new File([blob], file.name, { type: file.type }));
            //                 resolve();
            //             } catch (error) {
            //                 reject(error);
            //             }
            //         } else {
            //             reject(new Error('FileReader result is null'));
            //         }
            //     }
            //     reader.onerror = (error) => {reject(error)};
            //     reader.readAsArrayBuffer(file);
            // })
            // })
            // Promise.all(compressedPromise).then(() => {
            //     console.log(formData.get('files'))
            //     fetch(import.meta.env.VITE_BACKEND_URL+'/api/conversation/upload', {
            //         method: 'POST',
            //         body: formData,
            //         credentials: 'include'
            //     }).then((response) => response.json()).then((data: string[]) => {
            //         console.log("file data: ", data)
            //         data.forEach((path) => {
            //             socket.emit('chat message', {content: {text: path, file: true}, conversationId: conversation.id, createdAt: new Date()});
            //         })
            //     })
            //     setTimeout(() => {sendTextMessage()},50)
            // }).catch((error) => {
            //     console.error(error);})
            Array.from(files).forEach((file) => {
                formData.append('files', file);
            })
            fetch(import.meta.env.VITE_BACKEND_URL+'/api/conversation/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            }).then((response) => response.json()).then((data: string[]) => {
                console.log("file data: ", data)
                data.forEach((path) => {
                    socket.emit('chat message', {content: {text: path, file: true}, conversationId: conversation.id, createdAt: new Date()});
                })
            })
            setTimeout(() => {sendTextMessage()},50)
        }
        else {
            sendTextMessage()
        }
        if (!messages) {
            return;
        }
    }
    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && !isLoading && !fetchedAll.current) {
            const topMessage = e.currentTarget.firstChild;
            setIsLoading(true);
            console.log("fetching messages")
            const result = await fetch(import.meta.env.VITE_BACKEND_URL+url, {
                ...option,
                body: JSON.stringify({conversationId: conversation.id, amount: 10, skip: skip.current})
            })
            const data = await result.json();
            skip.current += 10;
            if (data.length === 0) {
                fetchedAll.current = true;
                setIsLoading(false);
                return;
            }
            setMessages(prevMessages => [...data, ...prevMessages]);
            setIsLoading(false);     
            canScroll.current = false;   
            if (topMessage) {
                (topMessage as HTMLElement).scrollIntoView();
            }    
        }
    }
    return (
        <>
            {   
                loading ? <p>Loading...</p>:
                error ? <p>Error: {error.message}</p>:
                <>
                    <nav className={styles.nav}>
                        <div className={styles.left}>
                            <h2>{conversation.name}</h2>
                            <button onClick={() => {console.log("clicked")}}>
                                <FontAwesomeIcon icon={faPlus} style={{color: 'black', fontWeight: 'bolder'}} className={styles.icon}/>
                            </button>
                        </div>
                        <div className={styles.right}>
                            <button onClick={() => {console.log("phone")}}>
                                <FontAwesomeIcon icon={faPhone} style={{color: 'white'}} className={styles.icon}/>
                            </button>
                            <button onClick={() => {console.log("video")}}>
                                <FontAwesomeIcon icon={faVideo} style={{color: 'white'}} className={styles.icon}/>
                            </button>
                        </div>

                    </nav>
                    <div className={styles.messagesContainer} onScroll={handleScroll}>
                        {isLoading && <p>Loading...</p>}
                        {messages.length > 0 && messages.map((message: IMessage) => {
                            return <Message key={message.id} message={message} senderName={conversation.participants.find(u => u.id === message.senderId)!.username} />
                        })}
                        <div ref={messagesEndRef}> </div>
                    </div>
                    <ChatSubmit onSend={handleSend} />
                </>
            }
        </>
    )
}