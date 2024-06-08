import chatappDB from '@src/infras/db/models/chatappDB';
import httpServer from '@infras/express/socket';
require('dotenv').config();

chatappDB.connect();

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});