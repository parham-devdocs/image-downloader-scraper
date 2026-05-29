import { Router, Request, Response } from "express";
import { login, logout, register } from "../controllers/auth"; // <-- where your real controller is
import upload from "../middlewares/multer";

const router = Router();

router.post(
  "/register",
//   upload.single("profilePic") as any,
  upload.single("profilePic") as any,
 
  register
  
);
router.post("/login", login);
router.get("/logout", logout);
export default router;
