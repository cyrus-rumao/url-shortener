import type { Request, Response } from "express";
export declare const createShortUrl: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const redirectShortUrl: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
export declare const getMyShortUrls: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteShortUrl: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=urls.controller.d.ts.map