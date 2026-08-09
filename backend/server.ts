import express from "express";
import cookieParser from "cookie-parser";
import { env } from "@/config/env.js";
import authRoutes from "@/routes/auth.route.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
