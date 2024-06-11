import Request from './Request'
import Conversation from './Conversation';
require('dotenv').config();
export default class User {
    constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly email: string,
        public requests?: Request[],
        public friends?: {id: string, name: string}[],
        public conversations?: Conversation[],
    ) {}
    isAdmin() {
        return this.username === process.env.ADMIN_NAME;
    }
}