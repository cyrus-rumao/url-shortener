import express from "express";
import cookieParser from "cookie-parser";
import { env } from "@/config/env.js";
import authRoutes from "@/routes/auth.route.js";
import urlRoutes from "@/routes/urls.route.js";
import { redirectShortUrl } from "@/controllers/urls.controller.js";
import path from "path";
import { errorMiddleware } from "@/middlewares/error.middleware.js";
const app = express();


app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.get("/:slug", redirectShortUrl);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// app.use((req, res) => {
//   res.status(404).sendFile(
//     path.join(__dirname, "../public/404.html"),
//   );
// });
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
