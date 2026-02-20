import api from '../config/axios';
import type { CreateTablePayload } from '../types/table/table.payload';
import type { TableResponse, TablesResponse, TableDetailResponse, GuestAssignResponse } from '../types/table/table.response';
import type { GuestListResponse } from '../types/guest/guest.response';

export const tableService = {
  async createTable(payload: CreateTablePayload): Promise<TableResponse> {
    const response = await api.post<TableResponse>('/tables', payload);
    return response.data;
  },

  async getAvailableGuests(): Promise<GuestListResponse> {
    const response = await api.get<GuestListResponse>('/tables/available-guests');
    return response.data;
  },

  async getAllTables(sort?: string, order?: string): Promise<TablesResponse> {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (order) params.append('order', order);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<TablesResponse>(`/tables${query}`);
    return response.data;
  },

  async getTableById(id: string): Promise<TableDetailResponse> {
    const response = await api.get<TableDetailResponse>(`/tables/${id}`);
    return response.data;
  },

  async assignGuestsToTable(tableId: string, guestIds: string[]): Promise<GuestAssignResponse> {
    const response = await api.put<GuestAssignResponse>(`/guests/table/${tableId}/assign`, { guestIds });
    return response.data;
  },

  async removeGuestsFromTable(tableId: string, guestIds: string[]): Promise<GuestAssignResponse> {
    const response = await api.put<GuestAssignResponse>(`/tables/${tableId}/remove-guests`, { guestIds });
    return response.data;
  },

  async renameTable(id: string, payload: { tableName: string }): Promise<TableResponse> {
    const response = await api.put<TableResponse>(`/tables/${id}/rename`, payload);
    return response.data;
  },

  async updateTable(id: string, payload: { tableName: string; tableNumber?: number; capacity: number; }): Promise<TableResponse> {
    const response = await api.put<TableResponse>(`/tables/${id}`, payload);
    return response.data;
  },

  async deleteTable(id: string): Promise<TableResponse> {
    const response = await api.delete<TableResponse>(`/tables/${id}`);
    return response.data;
  },
};
