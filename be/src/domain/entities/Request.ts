import User from "./User";

class Request {
    constructor(
        public readonly id: string,
        public readonly sender: User,
        public readonly receiver: User,
        public readonly createdAt: Date
    ) {}
}

export default Request;