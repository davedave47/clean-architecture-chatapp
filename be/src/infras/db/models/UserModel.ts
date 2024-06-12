import chatappDB from "../config/chatappDB";
import { Schema } from "mongoose";

const UserSchema = {
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    showFriends: {type: Boolean, default: false}
};

const UserModel = chatappDB.model('User', new Schema(UserSchema));

export default UserModel;