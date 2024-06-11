import chatappDB from "../config/chatappDB";
import { Schema } from "mongoose";

const MessageSchema = {
    sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    content: {
        type: {
            content: {type: String, required: true},
            file: {type: Boolean, required: true}
        }
    },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
};

const MessageModel = chatappDB.model('Message', new Schema(MessageSchema));

export default MessageModel;