
import { io } from "socket.io-client";

// The URL of your backend server
const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  // This enables the browser to send cookies (like your accessToken)
  // along with the initial handshake request.
  withCredentials: true, 

  // Forces the connection to start immediately using WebSockets.
  // This is often more reliable than the default "polling" fallback.
  transports: ["websocket"], 
  
  // This ensures it doesn't auto-connect if you aren't ready yet
  autoConnect: true, 
});