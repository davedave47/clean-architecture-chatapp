import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import onlineCache from "../db/config/onlineCache";
import { FriendUseCases, ConversationUseCases } from "@src/domain/use-cases";
import { FriendRepository, ConversationRepository } from "@src/infras/db/repository";
import jwt, { JwtPayload } from 'jsonwebtoken';
import parseCookie from 'cookie';
require('dotenv').config();

const friendRepository = new FriendRepository();
const friendUseCases = new FriendUseCases(friendRepository);

const conversationRepository = new ConversationRepository();
const conversationUseCases = new ConversationUseCases(conversationRepository);

const httpServer = createServer(app);
const io = new Server(httpServer,{
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

function authenticateUser(token: string): string|null {
  try {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  const decoded = jwt.verify(token, secret) as JwtPayload;
  const userId = decoded.id;
  return userId;
} catch (error) {
  return null;
}
}

io.on("connection", (socket) => {
  if (!socket.request.headers.cookie) {
    return socket.emit('authentication error');
  }
  const cookies = parseCookie.parse(socket.request.headers.cookie!);
  const userId = authenticateUser(cookies.token);
  socket.on("login", async () => {
    //Authentification
    if (userId === null) {
      return socket.emit('authentication error');
    }
    onlineCache.set(userId, socket.id);
    const friends = await friendUseCases.getFriends(userId);
    const talkedToUsers = await conversationUseCases.getTalkedToUsers(userId);
    const mergedUsers = [...new Set([...friends, ...talkedToUsers])];
    mergedUsers.forEach(async (user) => {
      const userSocketId = await onlineCache.get(user.id);
      if (userSocketId) {
        socket.to(userSocketId).emit('user logged in', userId);
      }
    });
    console.log('User logged in', userId);
  });
  socket.on("chat message", async (data) => {
    if (userId === null) {
      socket.emit('authentication error');
      return;
    }
    console.log(data)
    const message = await conversationUseCases.sendMessage(userId, data.conversationId, data.content, data.createdAt);
    const participants = await conversationUseCases.getParticipants(data.conversationId);
    participants.forEach(async (participant) => {
    const participantSocketId = await onlineCache.get(participant.id);
    if (participantSocketId) {
      console.log('sending message to', participantSocketId)
      if (participantSocketId === socket.id) {
        socket.emit('chat message', message);
      } else {
        socket.to(participantSocketId).emit('chat message', message);
      }
      }
    });
  });
  socket.on("disconnect", async () => {
    const userId = await onlineCache.get(socket.id);
    if (userId) {
      const friends = await friendUseCases.getFriends(userId);
      const talkedToUsers = await conversationUseCases.getTalkedToUsers(userId);
      const mergedUsers = [...new Set([...friends, ...talkedToUsers])];
      mergedUsers.forEach(async (user) => {
      const userSocketId = await onlineCache.get(user.id);
      if (userSocketId) {
        socket.to(userSocketId).emit('user logged out', userId);
        }
      });
    }
  });
});
export default httpServer;

