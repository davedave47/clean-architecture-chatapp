import messageDB from "../config/messageDB";
import {Schema} from "mongoose";

const MessageSchema = new Schema({
    senderId: {type: String, required: true},
    conversationId: {type: String, required: true},
    content: {
        text: {
            type: String,
            required: true
        },
        file: {
            type: Boolean,
            required: true
        },
    },
    createdAt: {type: Date, required: true}
});

const MessageModel = messageDB.model('Message', MessageSchema);

export default MessageModel;