

import { Router} from "express";
import {addMemberToGroup, createGroup,getMembershipStatus, findGroups, findMembersOfGroup, leaveGroup, deleteGroup, deleteallGroups, joinGroup, getMessagesInGroup, setProfilePicForGroup} from "../controllers/group";
import upload from "../middlewares/multer";
import { sendDocumentInGroup, sendMessageToGroup } from "../controllers/group";
const router = Router();


router.post("/", createGroup);
router.get("/", findGroups);
router.get("/:groupId/join",joinGroup)
router.post("/:groupId/add",addMemberToGroup)
router.get("/:groupId/membership",getMembershipStatus)
router.post("/group/file/:groupId",  upload.single("file") as any, sendDocumentInGroup);
router.post("/group", sendMessageToGroup);

router.post("/:groupId/leave",leaveGroup)
router.get("/:groupId/messages", getMessagesInGroup);
router.post("/:groupId/profilePic",  upload.single("profilePictures") as any, setProfilePicForGroup);

router.delete("/:groupId",deleteGroup)
router.delete("/",deleteallGroups)

export default router;