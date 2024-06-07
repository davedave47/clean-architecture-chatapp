interface IDatabase {
    connect(): void;
    disconnect(): void;
    query(query: string): any;
}

export default IDatabase;