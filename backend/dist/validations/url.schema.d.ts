import { z } from "zod";
export declare const createShortUrlSchema: z.ZodObject<{
    url: z.ZodURL;
    slug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateShortUrlSchemaInput = z.infer<typeof createShortUrlSchema>;
//# sourceMappingURL=url.schema.d.ts.map