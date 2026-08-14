import express from "express";
import { authenticate, optionalAuthenticate } from "@/middlewares/auth.middleare.js";
import {
  createShortUrl,
  deleteShortUrl,
  getMyShortUrls,
  redirectShortUrl,
} from "@/controllers/urls.controller.js";

const router = express.Router();
// console.log("Router hit")
router.post("/", optionalAuthenticate, createShortUrl);
router.get("/mine", authenticate, getMyShortUrls);
router.delete("/:id", authenticate, deleteShortUrl);
router.get("/:slug", redirectShortUrl);
// router.get("/id", getUrl)
export default router;
