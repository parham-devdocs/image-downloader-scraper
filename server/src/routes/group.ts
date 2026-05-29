

import { Router} from "express";
import {addMemberToGroup, createGroup,getMembershipStatus, findGroups, findMembersOfGroup, leaveGroup, deleteGroup, deleteallGroups, joinGroup, getMessagesInGroup, setProfilePicForGroup} from "../controllers/group";
import upload from "../middlewares/multer";
const router = Router();


router.post("/", createGroup);
router.get("/", findGroups);
router.get("/:groupId/join",joinGroup)
router.post("/:groupId/add",addMemberToGroup)
router.get("/:groupId/membership",getMembershipStatus)

router.post("/:groupId/leave",leaveGroup)
router.get("/:groupId/messages", getMessagesInGroup);
router.post("/:groupId/profilePic",  upload.single("profilePic") as any, setProfilePicForGroup);

router.delete("/:groupId",deleteGroup)
router.delete("/",deleteallGroups)

export default router;