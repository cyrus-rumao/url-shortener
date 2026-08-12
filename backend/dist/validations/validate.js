import { ZodType } from "zod";
export function validate(schema, data) {
    return schema.parse(data);
}
//# sourceMappingURL=validate.js.map