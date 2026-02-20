import api from '../config/axios';
import type { CreateGroupPayload, UpdateGroupPayload } from '../types/group/group.payload';
import type { GroupResponse, GroupsResponse } from '../types/group/group.response';

export const groupService = {
    async createGroup(payload: CreateGroupPayload): Promise<GroupResponse> {
        const response = await api.post<GroupResponse>('/groups', payload);
        return response.data;
    },

    async getAllGroups(): Promise<GroupsResponse> {
        const response = await api.get<GroupsResponse>('/groups');
        return response.data;
    },

    async getGroupById(id: string): Promise<GroupResponse> {
        const response = await api.get<GroupResponse>(`/groups/${id}`);
        return response.data;
    },

    async updateGroup(id: string, payload: UpdateGroupPayload): Promise<GroupResponse> {
        const response = await api.put<GroupResponse>(`/groups/${id}`, payload);
        return response.data;
    },

    async deleteGroup(id: string): Promise<GroupResponse> {
        const response = await api.delete<GroupResponse>(`/groups/${id}`);
        return response.data;
    },
};
