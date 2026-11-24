
import type { Request, Response, NextFunction } from "express";

import {
    httpRequestsTotal,
    activeRequests,
    reqResTime
} from "../../metrics/metrics.js";

const metricsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.path === "/metrics" || req.path === "/api/metrics") {
        next();
        return;
    }

    const start = process.hrtime.bigint();

    activeRequests.inc();

    let recorded = false;

    const recordMetrics = (statusCode: string) => {
        if (recorded) return;
        recorded = true;

        const duration =
            Number(process.hrtime.bigint() - start) / 1e9;

        // Actual requested URL, without query parameters
        const actualPath = req.path;

        // Route template, if available
        const route = res.locals.route ?? "unmatched";

        const labels = {
            method: req.method,
            route,
            status_code: statusCode,
        };

        httpRequestsTotal.inc(labels);
        reqResTime.observe(labels, duration);

        activeRequests.dec();

        const requestLog = {
            timestamp: new Date().toISOString(),
            level: Number(statusCode) >= 500 ? "error" : "info",
            method: req.method,
            path: actualPath,
            route,
            status_code: Number(statusCode),
            duration_ms: duration * 1000,
            user_agent: req.get("user-agent"),
            ip: req.ip,
        };

        console.log(JSON.stringify(requestLog));
    };

    res.once("finish", () => {
        recordMetrics(String(res.statusCode));
    });

    res.once("close", () => {
        if (!res.writableFinished) {
            recordMetrics("499");
        }
    });

    next();
};

export default metricsMiddleware;
