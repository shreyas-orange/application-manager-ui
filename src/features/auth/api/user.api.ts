import { apiClient } from "@/lib/api-client";

export interface CurrentUser {
  id: number;
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>(
    "/usersme",
  );

  return response.data;
}