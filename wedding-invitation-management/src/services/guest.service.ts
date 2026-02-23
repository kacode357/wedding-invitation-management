import api from '../config/axios';
import type { BulkGuestPayload, UpdateGuestPayload } from '../types/guest/guest.payload';
import type { BulkGuestResponse, GuestListResponse, GuestResponse, GuestSearchTableResponse } from '../types/guest/guest.response';

export const guestService = {
  async bulkCreateGuests(payload: BulkGuestPayload): Promise<BulkGuestResponse> {
    const response = await api.post<BulkGuestResponse>('/guests/bulk', payload);
    return response.data;
  },

  async getAllGuests(): Promise<GuestListResponse> {
    const response = await api.get<GuestListResponse>('/guests');
    return response.data;
  },

  async getUnassignedGuests(): Promise<GuestListResponse> {
    const response = await api.get<GuestListResponse>('/guests/unassigned');
    return response.data;
  },

  async getAssignedGuests(): Promise<GuestListResponse> {
    const response = await api.get<GuestListResponse>('/guests/assigned');
    return response.data;
  },

  async getGuestsByInvitationStatus(status: 'invited' | 'uninvited'): Promise<GuestListResponse> {
    const response = await api.get<GuestListResponse>(`/guests/invitations?status=${status}`);
    return response.data;
  },

  async markInvitationSent(id: string | number): Promise<GuestResponse> {
    const response = await api.put<GuestResponse>(`/guests/${id}/invitation/sent`);
    return response.data;
  },

  async getArrivedGuests(): Promise<GuestListResponse> {
    const response = await api.get<GuestListResponse>('/guests/arrived');
    return response.data;
  },

  async getUnarrivedGuests(): Promise<GuestListResponse> {
    const response = await api.get<GuestListResponse>('/guests/unarrived');
    return response.data;
  },

  async markArrived(id: string | number): Promise<GuestResponse> {
    const response = await api.put<GuestResponse>(`/guests/${id}/arrived`);
    return response.data;
  },

  async updateGuest(id: string | number, payload: UpdateGuestPayload): Promise<GuestResponse> {
    const response = await api.put<GuestResponse>(`/guests/${id}`, payload);
    return response.data;
  },

  async deleteGuest(id: string | number): Promise<GuestResponse> {
    const response = await api.delete<GuestResponse>(`/guests/${id}`);
    return response.data;
  },

  async searchGuestByTable(guestId: string): Promise<GuestSearchTableResponse> {
    const response = await api.get<GuestSearchTableResponse>(`/guests/search/table?guestId=${guestId}`);
    return response.data;
  },

  async createInvitation(id: string | number): Promise<GuestResponse> {
    const response = await api.put<GuestResponse>(`/guests/${id}/invitation/create`);
    return response.data;
  },

  async getPublicGuestByInvitationId(invitationId: string): Promise<GuestResponse> {
    const response = await api.get<GuestResponse>(`/guests/public/invitation/${invitationId}`);
    return response.data;
  },
};
