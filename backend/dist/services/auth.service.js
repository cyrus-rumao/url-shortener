// import type { Request, Response } from "express";
import { createUser, findByEmail } from "@/repositories/user.repository.js";
import { encryptPassword, verifyPassword } from "@/auth/password.js";
import { clearRefreshToken, generateAccessToken, generateRefreshToken, storeRefreshToken } from "@/auth/jwt.js";
export const signupService = async (signupBody) => {
    const existingUser = await findByEmail(signupBody.email);
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await encryptPassword(signupBody.password);
    return createUser(signupBody.name, signupBody.email, hashedPassword);
};
export const loginService = async (loginBody) => {
    const existingUser = await findByEmail(loginBody.email);
    if (!existingUser) {
        throw new Error("User does not exist");
    }
    if (!(await verifyPassword(existingUser.password, loginBody.password))) {
        throw new Error("Invalid password");
    }
    const accessToken = generateAccessToken(existingUser.id);
    const refreshToken = generateRefreshToken(existingUser.id);
    await storeRefreshToken(existingUser.id, refreshToken);
    return { user: existingUser, accessToken, refreshToken };
};
export const logoutService = async (userId) => {
    await clearRefreshToken(userId);
};
//# sourceMappingURL=auth.service.js.map