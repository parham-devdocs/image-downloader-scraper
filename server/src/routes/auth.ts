
import { Router, Request, Response } from "express";
import { login, logout, register } from "../controllers/auth"; // <-- where your real controller is

const router = Router();

// ✅ You don't need the arrow function; just pass the handler
router.post("/register", register);
router.post("/login", login);
router.get("/logout",logout)
export default router;