import chatappDB from "../config/chatappDB";
import { Schema } from "mongoose";

const friendSchema = {
    userId1: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    userId2: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now}
};

const FriendModel = chatappDB.model('Friends', new Schema(friendSchema));

export default FriendModel;
