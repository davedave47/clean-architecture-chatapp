import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import onlineCache from "../db/config/onlineCache";
import { FriendUseCases, ConversationUseCases, UserUseCases } from "@src/domain/use-cases";
import { FriendRepository, ConversationRepository, UserRepository } from "@src/infras/db/repository";
import { User } from "@src/domain/entities";
import jwt, { JwtPayload } from 'jsonwebtoken';
import parseCookie from 'cookie';
require('dotenv').config();

const userRepository = new UserRepository();
const userUseCases = new UserUseCases(userRepository);

const friendRepository = new FriendRepository();
const friendUseCases = new FriendUseCases(friendRepository);

const conversationRepository = new ConversationRepository();
const conversationUseCases = new ConversationUseCases(conversationRepository);

const httpServer = createServer(app);
const io = new Server(httpServer,{
  cors: {
    origin: process.env.CLIENT_URL!,
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 25e6,
});

async function authenticateUser(token: string): Promise<User | null> {
  try {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  const decoded = jwt.verify(token, secret) as JwtPayload;
  const userId = decoded.id;
  const user = await userUseCases.getUserById(userId);
  return user;
} catch (error) {
  return null;
}
}

io.on("connection", async (socket) => {
  if (!socket.request.headers.cookie) {
    return socket.emit('authentication error');
  }
  const cookies = parseCookie.parse(socket.request.headers.cookie!);
  const user= await authenticateUser(cookies.token);
  if (!user) {
    return socket.emit('authentication error');
  }
    await onlineCache.SADD(user.id, socket.id);
    const mergedUsers = await friendUseCases.getFriends(user.id);
    const online: User[] = []
    const promise = mergedUsers.map(async (u) => {
      const userSocketId = await onlineCache.SMEMBERS(u.id);
      console.log(u, userSocketId)
      if (userSocketId.length > 0) {
        userSocketId.forEach( (socketId) => {
          socket.to(socketId).emit('user logged on', user);
        })
        online.push(u);
      }
    });
  await Promise.all(promise);
  console.log('online', online)
  socket.emit('online', online);
  console.log('User logged in', user.username);
  socket.on("chat message", async (data) => {
    if (user === null) {
      socket.emit('authentication error');
      return;
    }
    async function sendMessage(senderId: string, conversationId: string, content: {text: string, file: boolean}, createdAt: Date): Promise<void>{
      const message = await conversationUseCases.sendMessage(senderId, conversationId, content, createdAt);
      const participants = await conversationUseCases.getParticipants(conversationId);
      participants.forEach(async (participant) => {
      const participantSocketId = await onlineCache.SMEMBERS(participant.id);
      if (participantSocketId.length > 0) {
        participantSocketId.forEach((socketId) => {
        console.log('sending message to', participantSocketId)
        if (socketId === socket.id) {
          socket.emit('chat message', message);
        } else {
          socket.to(participantSocketId).emit('chat message', message);
        }
      })
      }
      });
    }
    console.log(data)
    if (data.content.file) {
      for (let i = 0; i < data.content.files.length; i++) {
        const file = data.content.files[i];
        const filename = await conversationUseCases.uploadFile(file.filename, file.file);
        sendMessage(user.id, data.conversationId, {text: filename, file: true}, data.createdAt);
      }
      return;
    }
    sendMessage(user.id, data.conversationId, data.content, data.createdAt);
  });
  socket.on("disconnect", async () => {
    if (user === null) {
      socket.emit('authentication error');
      return;
    }
    console.log('User logged out', user.username)
      const mergedUsers  = await friendUseCases.getFriends(user.id);
      mergedUsers.forEach(async (u) => {
      const userSocketId = await onlineCache.SMEMBERS(u.id);
      if (userSocketId.length > 0) {
        userSocketId.forEach( (socketId) => {
        socket.to(socketId).emit('user logged out', user);})
        }
      });
      await onlineCache.SREM(user.id, socket.id)
  });
  socket.on("request", async (friendId)=>{
      if (user === null) {
        socket.emit('authentication error');
        return;
      }
      const result = await friendUseCases.requestFriend(user.id, friendId);
      if (!result) {
        socket.emit('friend request failed');
        return;
      }
      const friendSocketId = await onlineCache.SMEMBERS(friendId);
      if (friendSocketId.length > 0) {
        friendSocketId.forEach((socketId) => {
        socket.to(socketId).emit('friend request', user);})
      }
    })
    socket.on("accept", async (friendId)=>{
      if (user === null) {
        socket.emit('authentication error');
        return;
      }
      const result = await friendUseCases.acceptFriendRequest(user.id, friendId);
      if (!result) {
        socket.emit('friend request failed');
        return;
      }
      const friendSocketId = await onlineCache.SMEMBERS(friendId);
      if (friendSocketId.length > 0) {
        friendSocketId.forEach((socketId) => {
        socket.to(socketId).emit('friend accepted', user);})
      }
    })
    socket.on("reject", async (friendId)=>{
      if (user === null) {
        socket.emit('authentication error');
        return;
      }
      const result = await friendUseCases.rejectFriendRequest(user.id, friendId);
      if (!result) {
        socket.emit('friend request failed');
        return;
      }
      const friendSocketId = await onlineCache.SMEMBERS(friendId);
      if (friendSocketId.length > 0) {
        friendSocketId.forEach((socketId) => {
        socket.to(socketId).emit('friend rejected', user);})
      }
    })
    socket.on("remove request", async (friendId)=>{
      if (user === null) {
        socket.emit('authentication error');
        return;
      }
      const result = await friendUseCases.rejectFriendRequest(friendId, user.id);
      if (!result) {
        socket.emit('friend request failed');
        return;
      }
      const friendSocketId = await onlineCache.SMEMBERS(friendId);
      if (friendSocketId.length > 0) {
        friendSocketId.forEach((socketId) => {
        socket.to(friendSocketId).emit('request removed', user);})
      }
    })
    socket.on("create convo", async (participants) => {
      if (user === null) {
        socket.emit('authencication error');
      }
      console.log(participants)
      const convo = await conversationUseCases.createConversation([...participants, user]);
      socket.emit('convo', convo);
      participants.forEach(async (participant: User) => {
        const participantSocketId = await onlineCache.SMEMBERS(participant.id);
        if (participantSocketId.length > 0) {
            participantSocketId.forEach((socketId) => {
            socket.to(socketId).emit('convo', convo);})
          }
        });
    })
    socket.on("remove convo", async (convoId) => {
      if (user === null) {
        socket.emit('authentication error');
      }
      const participants = await conversationUseCases.getParticipants(convoId);
      const result = await conversationUseCases.deleteConversation(convoId);
      participants.forEach(async (participant: User) => {
        const participantSocketId = await onlineCache.SMEMBERS(participant.id);
        if (participantSocketId.length > 0) {
          participantSocketId.forEach((socketId) => {
            socket.to(socketId).emit('convo removed', convoId);})
          }
        });
    })
    socket.on("unfriend", async (friendId) => {
      if (user === null) {
        socket.emit('authentication error');
      }
      const result = await friendUseCases.deleteFriend(user.id, friendId);
      if (!result) {
        socket.emit('unfriend failed');
        return;
      }
      const friendSocketId = await onlineCache.SMEMBERS(friendId);
      console.log('unfriended', friendId)
      if (friendSocketId.length > 0) {
        friendSocketId.forEach((socketId) => {
        socket.to(socketId).emit('unfriended', user);})
      }
    })
});
export default httpServer;

