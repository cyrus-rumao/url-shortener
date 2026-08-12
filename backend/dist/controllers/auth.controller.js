import { signupSchema, loginSchema } from "@/validations/auth.schema.js";
import { loginService, logoutService, signupService } from "@/services/auth.service.js";
import { setAccessCookie, setRefreshCookie, clearAuthCookies } from "@/auth/cookies.js";
export const signup = async (req, res) => {
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
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to create user",
        });
    }
};
export const login = async (req, res) => {
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
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Login failed",
        });
    }
};
export const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await logoutService(userId);
        clearAuthCookies(res);
        return res.status(200).json({
            message: "Logout successful",
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Logout failed",
        });
    }
};
export const me = async (req, res) => {
    return res.status(200).json({
        message: "Authenticated user",
        user: req.user,
    });
};
//# sourceMappingURL=auth.controller.js.map