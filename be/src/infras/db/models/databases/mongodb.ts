import mongoose from 'mongoose'
export default class MongoDB {
    private uri: string;
    private models: { [key: string]: mongoose.Model<any> } = {};
    constructor(config: {host:string, database:string, port:number}) {
        this.uri = `mongodb://${config.host}:${config.port}/${config.database}`;
    }
    async connect(): Promise<void> {
        try {
            await mongoose.connect(this.uri);
            console.log('Connected to database');
        } catch (e) {
            console.error('Database connection error', e);
        }
    }
    disconnect(): void {
        mongoose.disconnect();
    }
    createModel(name: string, schema: mongoose.Schema): void {
        this.models[name] = mongoose.model(name, schema);
    }
    getModel(name: string): mongoose.Model<any> {
        const Model = this.models[name];
        if (!Model) {
            throw new Error('User model not found');
        }
        return this.models[name];
    }
}