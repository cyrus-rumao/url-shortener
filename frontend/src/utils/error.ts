import axios from "axios";
import type { ApiFailure } from "@/types/url";

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError<ApiFailure>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};