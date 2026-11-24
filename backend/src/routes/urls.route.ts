import express from "express";
import { authenticate, optionalAuthenticate } from "@/src/middlewares/auth.middleare.js";
import {
  createShortUrl,
  deleteShortUrl,
  getMyShortUrls,
  redirectShortUrl,
} from "@/src/controllers/urls.controller.js";
import { routeHandler } from "../config/routeHandler.js";

const router = express.Router();
console.log("Router hit URLS");
router.post(
  "/",
  optionalAuthenticate,
  routeHandler("/api/urls", createShortUrl)
);
router.get("/mine", routeHandler("/api/urls/mine", authenticate), getMyShortUrls);
router.delete("/:id", authenticate, routeHandler("/api/urls/:id", deleteShortUrl));
router.get("/:slug", routeHandler("/api/urls/:slug", redirectShortUrl));
// router.get("/id", getUrl)
export default router;
