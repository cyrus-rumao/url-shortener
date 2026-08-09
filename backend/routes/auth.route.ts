import express from "express";
import { signup, login, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "@/middlewares/auth.middleare.js";

const router = express.Router();
router.post("/login", login);
router.post("/register", signup);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
