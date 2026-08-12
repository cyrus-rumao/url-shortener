import type { LoginInput, SignupInput } from "@/validations/auth.schema.js";
export declare const signupService: (signupBody: SignupInput) => Promise<any>;
export declare const loginService: (loginBody: LoginInput) => Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
}>;
export declare const logoutService: (userId: string) => Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map