import Neode from "neode";
require("dotenv").config();
import { User, Conversation } from "../models";

function createConnection() {
    // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
    const URI = process.env.NEO4J_URI || 'neo4j://localhost';
    const USER = process.env.NEO4J_USERNAME || 'neo4j';
    const PASSWORD = process.env.NEO4J_PASSWORD || 'neo4j';
    try {
      const driver = new Neode(URI, USER, PASSWORD)
      driver.session().run('CALL dbms.components()')
      console.log('Connected to Neo4j')
      return driver;
    } catch(e) {
        const err = e as any
      console.log(`Connection error\n${err}`)
    }
};

const chatappDB = createConnection();

if (!chatappDB) {
    throw new Error('Failed to connect to Neo4j')
}

chatappDB.model('User', User);
chatappDB.model('Conversation', Conversation);

export default chatappDB as Neode;