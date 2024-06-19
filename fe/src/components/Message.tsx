import { IMessage} from '../interfaces';
import { useSelector} from 'react-redux';
import { RootState } from '../redux';

export default function Message({ message }: { message: IMessage}) {
    const user = useSelector((state: RootState) => state.user);
    const isOwnMessage = message.sender.id === user.id;
    return (
        <div className={`message ${isOwnMessage ? 'own' : 'other'}`} style = {
            {
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                margin: '5px',
                padding: '5px',
                backgroundColor: isOwnMessage ? 'lightblue' : 'lightgreen',
                borderRadius: '5px',
            
        }}>
            <div style={
                {
                    fontSize: '0.8em',
                    color: 'gray',
                }
            }>{message.createdAt.substring(11,16)}</div>
            <span className="message-sender">
                {(isOwnMessage ? 'You' : message.sender.username) + ': '}
            </span>
            <span className="message-content">
                {message.content.text}
            </span>
        </div>
    );
}