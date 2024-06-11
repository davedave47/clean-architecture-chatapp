import chatappDB from "../config/chatappDB";
import { Schema } from "mongoose";

const ConversationSchema = {
    participants: [{type: Schema.Types.ObjectId, ref: 'User', required: true}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    messages: [{type: Schema.Types.ObjectId, ref: 'Message'}],
};

const ConversationModel = chatappDB.model('Conversation', new Schema(ConversationSchema));

export default ConversationModel;