
import { Router} from "express";

import {DeleteMessages, markChatMessageAsRead } from "../controllers/message";
import upload from "../middlewares/multer";

const router = Router();




router.delete("/",DeleteMessages)
router.put("/read", markChatMessageAsRead);

export default router;