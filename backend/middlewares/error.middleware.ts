import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextFunction, Request, Response } from "express";
import {
    AuthServiceError,
    UrlServiceError,
} from "@/types/error.js";
import { ZodError } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urlErrorPagePath = path.resolve(
    __dirname,
    "../public/url-error.html",
);

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export const errorMiddleware = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    if (error instanceof UrlServiceError) {
        if (
            error.errors.includes("URL_NOT_FOUND") ||
            error.errors.includes("URL_EXPIRED")
        ) {
            const html = fs
                .readFileSync(urlErrorPagePath, "utf-8")
                .replace(/{{STATUS_CODE}}/g, String(error.statusCode))
                .replace(/{{MESSAGE}}/g, escapeHtml(error.message));

            return res.status(error.statusCode).send(html);
        }

        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
    }
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message:
                error.issues?.[0]?.message ?? "Validation failed",
            errors:
                error.issues?.map((issue) => issue.message) ?? [],
        });
    }
    if (error instanceof AuthServiceError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: ["INTERNAL_SERVER_ERROR"],
    });
};