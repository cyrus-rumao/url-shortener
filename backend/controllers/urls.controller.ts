import type { Request, Response ,NextFunction} from "express";
import {
  createShortUrlService,
  deleteUserShortUrlService,
  getUserShortUrlsService,
  resolveOriginalUrlBySlugService,
} from "@/services/url.service.js";
import { createShortUrlSchema } from "@/validations/url.schema.js";
import { UrlServiceError } from "@/types/error.js";
const getRequestOrigin = (req: Request) => `${req.protocol}://${req.get("host")}`;

export const createShortUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Route hit");

    const input = createShortUrlSchema.parse(req.body);
    const createdUrl = await createShortUrlService(
      input,
      req.user ? req.user.id : null,
      getRequestOrigin(req),
    );
    console.log("Created URL: ",createdUrl);
    return res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: createdUrl,
    });
  } catch (error) {
    return next(error);
  }
};

  export const redirectShortUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slugParam = req.params.slug;
      console.log("Slug parameter: ", slugParam);
      if (typeof slugParam !== "string" || !slugParam.trim()) {
        return res.status(400).json({
          success: false,
          message: "Slug is required",
          errors: ["INVALID_SLUG"],
        });
      }

      const originalUrl = await resolveOriginalUrlBySlugService(slugParam);
      return res.redirect(302, originalUrl);
    } catch (error) {
      return next(error);
    }
  };

export const getMyShortUrls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const urls = await getUserShortUrlsService(req.user.id, getRequestOrigin(req));

    return res.status(200).json({
      success: true,
      message: "Short URLs fetched successfully",
      data: urls,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteShortUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const urlId = req.params.id;

    if (typeof urlId !== "string" || !urlId.trim()) {
      return res.status(400).json({
        success: false,
        message: "URL id is required",
        errors: ["INVALID_URL_ID"],
      });
    }

    await deleteUserShortUrlService(urlId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Short URL deleted permanently",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};