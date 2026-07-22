export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  role: UserRole | null;
  created_at: string;
}

export interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}
