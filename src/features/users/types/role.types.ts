export interface Role {
  id: number;
  name: string;
}

export interface RolesResponse {
  items: Role[];
  total: number;
}

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  name: string;
}
