import { Router } from "express";
import { register } from "../../metrics/metrics.js";

const router = Router();

router.get("/", async (_req, res) => {
    res.setHeader("Content-Type", register.contentType);
    // const metrics = await register.metrics();
    res.end(await register.metrics());
});

export default router;