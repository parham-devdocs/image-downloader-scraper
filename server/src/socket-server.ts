import { Server } from "socket.io";
import jwt from "jsonwebtoken";

export let io: Server;

export function initSocket(httpServer: any) {
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
      // decoded = { payload: 'email...', iat: ..., exp: ... }
      (socket as any).user = decoded; 
      console.log( (socket as any).user  )
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  const connectedUsers = new Map();

  io.on('connection', (socket: any) => {
    // Correctly extract the email/identifier from the decoded payload
    const userEmail = socket.user.payload; 
    
    console.log(`✅ User connected: ${userEmail}`);

    socket.on("join_room", (groupId: string) => {
      socket.join(groupId);
      
      // Store the userEmail in the map
      connectedUsers.set(socket.id, { userEmail, room: groupId });

      const usersInRoom = Array.from(connectedUsers.values())
        .filter(u => u.room === groupId)
        .map(u => u.userEmail);

      io.in(groupId).emit("user in room", usersInRoom);
      
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${userEmail} has joined`,
        user: userEmail
      });
    });

    socket.on("typing", (groupId: string) => {
      socket.to(groupId).emit("typing_indicator", {
        userId: userEmail,
        isTyping: true
      });
    });

    socket.on("stop_typing", (groupId: string) => {
      socket.to(groupId).emit("typing_indicator", {
        userId: userEmail,
        isTyping: false
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log('❌ User disconnected', socket.id);
    });
  });
}
