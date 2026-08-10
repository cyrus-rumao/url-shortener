import { AxiosError } from "axios";
import type { ApiFailure } from "@/types/url";
export const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as Partial<ApiFailure> | undefined;
    return responseData?.message ?? "Failed to shorten URL";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to shorten URL";
};
