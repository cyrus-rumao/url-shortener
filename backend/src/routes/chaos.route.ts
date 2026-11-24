import type { Request, Response } from "express";
import { randomInt } from "node:crypto";
import { Router } from "express";
const router = Router();

const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

router.get("/random", async (req: Request, res: Response) => {
    // Random delay between 10ms and 15 seconds
    res.locals.route = "/api/chaos/random";
    const delay = randomInt(10, 15001);

    // 20% chance of failure    
    const shouldFail = randomInt(1, 101) <= 20;

    console.log({
        message: "Chaos endpoint triggered",
        delay,
        shouldFail,
    });

    await sleep(delay);

    if (shouldFail) {
        return res.status(500).json({
            success: false,
            message: "Simulated internal server error",
            delay,
        });
    }

    return res.status(200).json({
        success: true,
        message: "Chaos test completed successfully",
        delay,
    });
});

export default router;