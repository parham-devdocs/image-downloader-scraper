
import { Router} from "express";

import { sendMessageToGroup, DeleteMessages,  sendMessageToChat,markChatMessageAsRead, sendDocumentInGroup } from "../controllers/message";
import upload from "../middlewares/multer";

const router = Router();

router.post("/group", sendMessageToGroup);
router.post("/group/file/:groupId",  upload.single("file") as any, sendDocumentInGroup);

router.post("/chat", sendMessageToChat);

router.delete("/",DeleteMessages)
router.put("/read", markChatMessageAsRead);

export default router;