import Request from './Request'
import Conversation from './Conversation';
require('dotenv').config();
export default class User {
    constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly email: string,
    ) {}
    isAdmin() {
        return this.username === process.env.ADMIN_NAME;
    }
}