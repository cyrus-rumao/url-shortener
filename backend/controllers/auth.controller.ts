import type { Request, Response, NextFunction } from "express";
// import {zodError} from 'zod';
import { signupSchema, loginSchema } from "@/validations/auth.schema.js";
import { loginService, logoutService, signupService } from "@/services/auth.service.js";
import { setAccessCookie, setRefreshCookie, clearAuthCookies } from "@/auth/cookies.js";
import { AuthServiceError } from "@/types/error.js";
export const signup = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const signupBody = signupSchema.parse(req.body);
    const user = await signupService(signupBody);
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }
  catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const loginBody = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await loginService(loginBody);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    // console.log(object)
    next(error);
  }
};
export const logout = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const userId = req.user.id;
    await logoutService(userId);
    clearAuthCookies(res);
    return res.status(200).json({
      message: "Logout successful",
    });
  }
  catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Authenticated user",
    user: req.user,
  });
};