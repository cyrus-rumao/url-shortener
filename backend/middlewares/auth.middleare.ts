import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env.js";
import { findById } from "@/repositories/user.repository.js";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                message: "Unauthenticated",
            });
        }

        const decoded = jwt.verify(
            accessToken,
            env.JWT_ACCESS_SECRET
        ) as { userId: string };

        const user = await findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "Token expired",
            });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }

        next(error);
    }
};