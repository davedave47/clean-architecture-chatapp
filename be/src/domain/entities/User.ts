require('dotenv').config();
export default class User {
    id: string;
    username: string;
    email: string;
    password: string;
    constructor(id: string, username: string, email: string, password: string) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }
    isAdmin() {
        return this.username === process.env.ADMIN_NAME;
    }
}