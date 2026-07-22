export type CloudProvider =
  | "AWS"
  | "AZURE"
  | "GCP";

export interface CloudConfiguration {
  id: number;
  name: string;
  provider: CloudProvider | string;
  region?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface CloudListResponse {
  items: CloudConfiguration[];
  total: number;
  page: number;
  size: number;
  total_pages?: number;
}

export interface GetCloudParams {
  page: number;
  size: number;
  search?: string;
}

export interface CreateCloudRequest {
  name: string;
  provider: string;
  region?: string;
  description?: string;
  is_active: boolean;
}

export interface UpdateCloudRequest {
  name: string;
  provider: string;
  region?: string;
  description?: string;
  is_active: boolean;
}

export interface TestCloudResponse {
  success: boolean;
  message: string;
}