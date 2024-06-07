import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export default httpServer;