import messageDB from "../config/messageDB";
import {Schema} from "mongoose";

const MessageSchema = new Schema({
    senderId: {type: Schema.Types.ObjectId, required: true},
    conversationId: {type: Schema.Types.ObjectId, required: true},
    content: {type: String, required: true},
    timestamp: {type: Date, required: true}
});

const MessageModel = messageDB.model('Message', MessageSchema);

export default MessageModel;