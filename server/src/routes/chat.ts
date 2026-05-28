
import { Router, Request, Response } from "express";
import { JoinChatRoom,ChatList, getMessagesInChat } from "../controllers/chat";

const router = Router();

// ✅ You don't need the arrow function; just pass the handler

router.get("/joinChatRoom/:userId", JoinChatRoom);
router.get("/chatList",ChatList)
router.get("/:chatId/messages", getMessagesInChat);

export default router;