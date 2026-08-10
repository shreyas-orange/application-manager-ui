export interface UploadFileResponse {
  id: number;
  file_name: string;
  original_file_name?: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  uploaded_at: string;
  created_at: string;
  updated_at?: string;
}

export interface UploadListResponse {
  items: UploadFileResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GetUploadsParams {
  page: number;
  pageSize: number;
  search?: string;
}