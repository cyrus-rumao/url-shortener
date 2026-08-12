import { env } from "@/config/env.js";
export function setAccessCookie(res, token) {
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });
}
export function setRefreshCookie(res, token) {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
export function clearAuthCookies(res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    // console.log("Auth cookies cleared");
}
//# sourceMappingURL=cookies.js.map