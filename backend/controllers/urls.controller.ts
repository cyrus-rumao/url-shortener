import type { Request, Response } from "express";
import {
  UrlServiceError,
  createShortUrlService,
  deleteUserShortUrlService,
  getUserShortUrlsService,
  resolveOriginalUrlBySlugService,
} from "@/services/url.service.js";
import { createShortUrlSchema } from "@/validations/url.schema.js";

const getRequestOrigin = (req: Request) => `${req.protocol}://${req.get("host")}`;

export const createShortUrl = async (req: Request, res: Response) => {
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
    if (error instanceof UrlServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create short URL",
      errors: [],
    });
  }
};

export const redirectShortUrl = async (req: Request, res: Response) => {
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
    if (error instanceof UrlServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to resolve short URL",
      errors: [],
    });
  }
};

export const getMyShortUrls = async (req: Request, res: Response) => {
  try {
    const urls = await getUserShortUrlsService(req.user.id, getRequestOrigin(req));

    return res.status(200).json({
      success: true,
      message: "Short URLs fetched successfully",
      data: urls,
    });
  } catch (error) {
    if (error instanceof UrlServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch short URLs",
      errors: [],
    });
  }
};

export const deleteShortUrl = async (req: Request, res: Response) => {
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
    if (error instanceof UrlServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete short URL",
      errors: [],
    });
  }
};