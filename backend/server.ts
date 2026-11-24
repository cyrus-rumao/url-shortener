import express from "express";
import cookieParser from "cookie-parser";
import { env } from "@/src/config/env.js";
import authRoutes from "@/src/routes/auth.route.js";
import urlRoutes from "@/src/routes/urls.route.js";
import chaosRoutes from "@/src/routes/chaos.route.js";
import { redirectShortUrl } from "@/src/controllers/urls.controller.js";
import path from "path";
import { errorMiddleware } from "@/src/middlewares/error.middleware.js";
import metricsMiddleware from "./src/prisma/metrics.middleware.js";
import metricsRoutes from "./src/routes/metrics.routes.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware);
// app.use((req, res, next) => {
//   console.log("REQUEST:", req.method, req.originalUrl);
//   next();
// });
app.use("/api/chaos", chaosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.use("/api/metrics", metricsRoutes);
// app.use()
app.get("/:slug", redirectShortUrl);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});


const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
