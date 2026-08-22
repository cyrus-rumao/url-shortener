// import type { Request, Response } from "express";
import { createUser, findByEmail } from "@/repositories/user.repository.js";
import type { LoginInput, SignupInput } from "@/validations/auth.schema.js";
import { encryptPassword, verifyPassword } from "@/auth/password.js";
import { clearRefreshToken, generateAccessToken, generateRefreshToken, storeRefreshToken } from "@/auth/jwt.js";
import { AuthServiceError } from "@/types/error.js";
export const signupService = async (signupBody: SignupInput) => {
    const existingUser = await findByEmail(signupBody.email);
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await encryptPassword(signupBody.password);
    return createUser(signupBody.name, signupBody.email, hashedPassword);
};

export const loginService = async (loginBody: LoginInput) => {
    const existingUser = await findByEmail(loginBody.email);
    if (!existingUser) {
        throw new AuthServiceError("User does not exist", 401, ["USER_NOT_FOUND"]);
    }
    if (!(await verifyPassword(existingUser.password, loginBody.password))) {
        throw new AuthServiceError("Invalid email or password", 400, ["INVALID_CREDENTIALS"]);
    }
    const accessToken = generateAccessToken(existingUser.id);
    const refreshToken = generateRefreshToken(existingUser.id);

    await storeRefreshToken(existingUser.id, refreshToken);
    return { user: existingUser, accessToken, refreshToken };
}
export const logoutService = async  (userId: string) => {
    await clearRefreshToken(userId);
}