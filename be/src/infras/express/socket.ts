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
  }
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
  console.log(user.id + " connected")
  socket.on("login", async () => {
    console.log("---------------------------------------------------------------------------------------\nhi")
    //Authentification
    if (user === null) {
      console.log('User not authenticated')
      return socket.emit('authentication error');
    }
    await onlineCache.set(user.id, socket.id);
    const mergedUsers = await friendUseCases.getFriends(user.id);
    const online: User[] = []
    const promise = mergedUsers.map(async (u) => {
      const userSocketId = await onlineCache.get(u.id);
      if (userSocketId) {
        console.log(u, "is online")
        socket.to(userSocketId).emit('user logged on', user);
        online.push(u);
      }
    });
    await Promise.all(promise);
    console.log("oneline friends",online)
    socket.emit('online', online);
    console.log('User logged in', user.id);
  });
  socket.on("chat message", async (data) => {
    if (user === null) {
      socket.emit('authentication error');
      return;
    }
    console.log(data)
    const message = await conversationUseCases.sendMessage(user.id, data.conversationId, data.content, data.createdAt);
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
    if (user === null) {
      socket.emit('authentication error');
      return;
    }
    console.log('User logged out', user.id)
      const mergedUsers  = await friendUseCases.getFriends(user.id);
      mergedUsers.forEach(async (u) => {
      const userSocketId = await onlineCache.get(u.id);
      if (userSocketId) {
        socket.to(userSocketId).emit('user logged out', user);
        }
      });
    await onlineCache.del(user.id)
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
      const friendSocketId = await onlineCache.get(friendId);
      if (friendSocketId) {
        socket.to(friendSocketId).emit('friend request', user);
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
      const friendSocketId = await onlineCache.get(friendId);
      if (friendSocketId) {
        socket.to(friendSocketId).emit('friend accepted', user);
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
      const friendSocketId = await onlineCache.get(friendId);
      if (friendSocketId) {
        socket.to(friendSocketId).emit('friend rejected', user);
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
      const friendSocketId = await onlineCache.get(friendId);
      if (friendSocketId) {
        socket.to(friendSocketId).emit('request removed', user);
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
        const participantSocketId = await onlineCache.get(participant.id);
        if (participantSocketId) {
            socket.to(participantSocketId).emit('convo', convo);
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
        const participantSocketId = await onlineCache.get(participant.id);
        if (participantSocketId) {
            socket.to(participantSocketId).emit('convo removed', convoId);
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
      const friendSocketId = await onlineCache.get(friendId);
      console.log('unfriended', friendId)
      if (friendSocketId) {
        socket.to(friendSocketId).emit('unfriended', user);
      }
    })
});
export default httpServer;

