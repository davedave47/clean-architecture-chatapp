import chatappDB from "../config/chatappDB";
import { Schema } from "mongoose";

const friendSchema = new Schema({
    userId1: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    userId2: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now}
});

friendSchema.index({ userId1: 1, userId2: 1 }, { unique: true });

const FriendModel = chatappDB.model('Friends', friendSchema);

export default FriendModel;
