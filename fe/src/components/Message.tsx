import { IMessage} from '../interfaces';
import { useSelector} from 'react-redux';
import { RootState } from '../redux';
import VideoPlayer from './VideoPlayer';

export default function Message({ message, senderName }: { message: IMessage, senderName: string }) {
    const user = useSelector((state: RootState) => state.user);
    const isOwnMessage = message.senderId === user.id;
    const filename = message.content.text.split('/').pop()?.replace(/-\d+$/, '')
    const fileExtension = filename?.substring(filename.lastIndexOf('.') + 1);
    const isImage = fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif';
    const isVideo = fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'ogg' || fileExtension === 'mov';
    // const mimeType = fileExtension === 'mov' ? 'video/mp4' : `video/${fileExtension}`;

    return (
        <div className={`message ${isOwnMessage ? 'own' : 'other'}`} style = {
            {
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                margin: '5px',
                padding: '5px',
                backgroundColor: isOwnMessage ? 'lightblue' : 'lightgreen',
                borderRadius: '5px',
                maxWidth: "60%",
                color: "black"
        }}>
            <div style={
            {
            fontSize: '0.8em',
            color: 'gray',
            }
            }>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <span className="message-sender">
                {(isOwnMessage ? 'You' : senderName) + ': '}
            </span>
            <span style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            
            }}>
                {message.content.file ? 
                    isImage? 
                    <div>
                        <a href={import.meta.env.VITE_BACKEND_URL+"/uploads/"+message.content.text}>
                        <img src={import.meta.env.VITE_BACKEND_URL+"/uploads/"+message.content.text} style={{
                        maxWidth: '100%',
                        maxHeight: '500px',
                        objectFit: 'contain',
                        cursor: 'pointer'
                    }}/>
                        </a>
                    </div>
                    :
                    isVideo? 
                    <VideoPlayer src={import.meta.env.VITE_BACKEND_URL+"/uploads/"+message.content.text}/>
                   :
                    <a href={import.meta.env.VITE_BACKEND_URL+"/uploads/"+message.content.text} download>
                        {message.content.text.split('/').pop()?.replace(/-\d+$/, '')}
                    </a>
                :
                message.content.text}
            </span>
        </div>
    );
}
