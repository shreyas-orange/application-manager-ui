export interface UploadFileResponse {
  id: number;
  file_name: string;
  original_file_name: string;
  file_path: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  uploaded_by: number;
  uploaded_at: string;
}

export interface UploadFileError {
  detail?: string;
  message?: string;
}
