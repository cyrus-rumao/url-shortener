import express from "express";
import { signup, login, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "@/src/middlewares/auth.middleare.js";
import { routeHandler } from "@/src/config/routeHandler.js";
const router = express.Router();
router.post("/login", routeHandler("/api/auth/login", login));
router.post("/register", routeHandler("/api/auth/register", signup));
router.get("/me", authenticate, routeHandler("/api/auth/me", me));
router.post("/logout", authenticate, routeHandler("/api/auth/logout", logout));

export default router;
