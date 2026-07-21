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
  role: UserRole;
  created_at: string;
}

export interface UsersResponse {
  items: User[];
  total: number;
}