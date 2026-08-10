import { getErrorMessage } from "@/utils/error";
import { api } from "@/services/axios";
import type {
  
  ApiResponse,
  CreateShortUrlData,
  CreateShortUrlPayload,
  UserShortUrl,
} from "@/types/url";

export const createShortUrl = async (payload: CreateShortUrlPayload) => {
  try {
    const response = await api.post<ApiResponse<CreateShortUrlData>>(
      "/urls",
      payload,
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export const getMyShortUrls = async () => {
  try {
    const response = await api.get<ApiResponse<UserShortUrl[]>>("/urls/mine");

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export const deleteShortUrl = async (id: string) => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/urls/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};
