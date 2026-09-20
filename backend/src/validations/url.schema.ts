import { z } from "zod";

export const createShortUrlSchema = z.object({
  url: z.url("Please provide a valid URL"),
  slug: z
    .string()
    .trim()
    .min(3, "Custom slug must be at least 3 characters")
    .max(50, "Custom slug must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Custom slug can only include letters, numbers, - and _",
    )
    .optional(),
});

export type CreateShortUrlSchemaInput = z.infer<typeof createShortUrlSchema>;
