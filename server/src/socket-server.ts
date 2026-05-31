import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "./model/user";

export let io: Server;

export async function initSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  io.use((socket, next) => {
    const rawCookieHeader = socket.request.headers.cookie;
    console.log({rawCookieHeader})
    if (!rawCookieHeader) return next(new Error("No cookies"));

    // Better cookie parsing
    const cookies = Object.fromEntries(
      rawCookieHeader.split('; ').map((c) => {
        const [key, ...v] = c.split('=');
        return [key.trim(), v.join('=')];
      })
    );

    const token = cookies['accessToken'];
    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string);
      (socket as any).user = decoded; 
      console.log((socket as any).user)
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  const connectedUsers = new Map();

  io.on('connection', async (socket: any) => {
    const userId = socket.user.payload; 
    const user=await UserModel.findById(userId)
    console.log(`✅ User connected: ${userId}`);

    socket.on("join_room", (groupId: string) => {
      // Leave previous room if exists
      const previousRoom = connectedUsers.get(socket.id)?.room;
      if (previousRoom) {
        socket.leave(previousRoom);
      }
      
      // Join new room
      socket.join(groupId);
      
      // Store the userEmail in the map
      connectedUsers.set(socket.id, { userId, room: groupId });

      // Get users in the room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter(u => u.room === groupId)
        .map(u => u.userEmail);

      // Send updated user list to everyone in the room
      io.in(groupId).emit("user in room", usersInRoom);
      
      // Notify others that user joined
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`,
        user: user?.username
      });
      
      console.log(`${user?.username} joined room: ${groupId}`);
    });

    socket.on("send_message", (data:any) => {
      console.log("Message received:", data);
      // Broadcast to everyone in the room including sender
      io.in(data.room).emit("receive_message", {
        _id: Date.now().toString(),
        content: data.message,
        createdAt: new Date(),
        sender: data.sender,
        seen: []
      });
    });

    socket.on("typing", (groupId: string) => {
      socket.to(groupId).emit("typing_indicator", {
        userId: user?.username,
        isTyping: true
      });
      
      // Clear typing indicator after 1 second of no typing
      clearTimeout(socket.typingTimeout);
      socket.typingTimeout = setTimeout(() => {
        socket.to(groupId).emit("typing_indicator", {
          userId: user?.username,
          isTyping: false
        });
      }, 1000);
    });

    socket.on("stop_typing", (groupId: string) => {
      socket.to(groupId).emit("typing_indicator", {
        userId: user?.username,
        isTyping: false
      });
    });

    socket.on("leave_room", (groupId: string) => {
      socket.leave(groupId);
      connectedUsers.delete(socket.id);
      
      // Update remaining users in the room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter(u => u.room === groupId)
        .map(u => u.userEmail);
      
      io.in(groupId).emit("user in room", usersInRoom);
      
      socket.to(groupId).emit("notification", {
        type: "USER_LEFT",
        message: `${user?.username} has left`,
        user: user?.username
      });
      
      console.log(`${user?.username} left room: ${groupId}`);
    });

    socket.on('disconnect', () => {
      const userInfo = connectedUsers.get(socket.id);
      if (userInfo) {
        const { userEmail, room } = userInfo;
        connectedUsers.delete(socket.id);
        
        // Update users in the room
        const usersInRoom = Array.from(connectedUsers.values())
          .filter(u => u.room === room)
          .map(u => u.userEmail);
        
        io.in(room).emit("user in room", usersInRoom);
        
        io.in(room).emit("notification", {
          type: "USER_LEFT",
          message: `${userEmail} has disconnected`,
          user: userEmail
        });
        
        console.log(`❌ User disconnected: ${userEmail}`);
      }
    });
  });
}