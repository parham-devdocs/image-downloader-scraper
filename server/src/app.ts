import express from "express";
import {  Server } from "socket.io";
import db from "./db";
import http from "http";
import dotenv from "dotenv";
import routes from "./routes";
import { initSocket } from "./socket-server";
import cookieParser from "cookie-parser";
import cors from "cors";
import { verifyAccessToken } from "./middlewares/verifyToken";
dotenv.config(); // loads .env

const app = express();

export const server = http.createServer(app);
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  exposedHeaders: ['set-cookie'], // ✅ Important: expose set-cookie header
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// ✅ Handle preflight requests
app.options('*', cors());

app.use(cookieParser());

app.use((req, res, next) => {
  console.log('--- Incoming Request Headers ---');
  console.log(req.headers); // This will show all headers including 'cookie'
  console.log('-------------------------------');
  next();
});

app.use(express.json()); 
app.use("/api", routes);

initSocket(server); 

server.listen(5000, () =>{ 
  db(process.env.MONGOOSE_CONNECTION_URI as string)
  .then(()=>{console.log("connected to db")}) 
  .catch(()=>{console.log("not abale to connect to db")})
  console.log(`Server listening on port 5000`);
  
});