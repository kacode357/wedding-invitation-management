export interface User {
  id: string;
  _id?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  token?: string;
  user?: User;
}

// Helper type for API response with data wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
