import chatappDB from "../config/chatappDB";
import { Schema } from "mongoose";

const UserSchema = new Schema({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

const UserModel = chatappDB.model('User', UserSchema);

export default UserModel;
