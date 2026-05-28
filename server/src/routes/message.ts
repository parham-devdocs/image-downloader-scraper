
import { Router} from "express";

import { sendMessageToGroup, DeleteMessages,  sendMessageToChat,markChatMessageAsRead } from "../controllers/message";

const router = Router();

router.post("/group", sendMessageToGroup);
router.post("/chat", sendMessageToChat);

router.delete("/",DeleteMessages)
router.put("/read", markChatMessageAsRead);

export default router;