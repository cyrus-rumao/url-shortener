import type { Request, Response } from "express";
import { signupSchema, loginSchema, type SignupInput, type LoginInput } from "@/validations/auth.schema.js";
import { loginService, logoutService, signupService } from "@/services/auth.service.js";
// import { findByEmail } from "@/repositories/user.repository.js";
import { setAccessCookie, setRefreshCookie, clearAuthCookies } from "@/auth/cookies.js";
export const signup = async (
  req: Request, res: Response
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
        // password: user.password,
      },
    });
  }
  catch (error) {
    console.log("Error here 1")
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
};

export const login = async (
  req: Request, res: Response
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
    console.log("Error here 3", error)
  }
};
export const logout = async (
  req: Request, res: Response
) => {
  try {
    console.log("Logout request body:", req.user);
    const userId = req.user.id;
    await logoutService(userId);
    clearAuthCookies(res);
    return res.status(200).json({
      message: "Logout successful",
    });
  }
  catch (error) {
    console.log("Error here 4", error)
  }
};