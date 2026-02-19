import api from '../config/axios';
import type { LoginPayload } from '../types/auth/auth.payload';
import type { AuthResponse } from '../types/auth/auth.response';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    
    // Handle nested response structure - API returns { success, data: { token, user } }
    if (response.data.success && response.data.data) {
      return {
        success: true,
        token: response.data.data.token,
        user: response.data.data.user,
      };
    }
    
    return response.data;
  },
};
