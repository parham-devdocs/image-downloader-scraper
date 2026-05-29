import dotenv from "dotenv";
import { Router } from "express";
import authRoute from "./auth";
import userRoute from "./user";
import chatRoute from "./chat";
import groupRoute from "./group";
import messageRoute from "./message";
import { verifyAccessToken } from "../middlewares/verifyToken";
import upload from "../middlewares/multer";
const router = Router();
dotenv.config();

router.use("/auth", authRoute);
router.use("/user", verifyAccessToken(), userRoute);
router.use("/chat", verifyAccessToken(), chatRoute);
router.use("/group", verifyAccessToken(), groupRoute);
router.use("/message", verifyAccessToken(), messageRoute);
export default router;
