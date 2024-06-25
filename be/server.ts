import httpServer from '@infras/express/socket';
require('dotenv').config();

const PORT = parseInt(process.env.PORT || '3000');
httpServer.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});