import api from '../config/axios';
import type { DashboardResponse } from '../types/dashboard/dashboard.response';

export const dashboardService = {
  async getDashboard(): Promise<DashboardResponse> {
    const response = await api.get<DashboardResponse>('/dashboard');
    return response.data;
  },
};
