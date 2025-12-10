import api from './api';
import type { ApiResponse, AdminStats, PaginatedUsers, AdminUserResponse } from '@/types';

export const adminService = {
    getStats: async (): Promise<AdminStats> => {
        const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
        return response.data.data!;
    },

    getAllUsers: async (page = 1, limit = 10): Promise<PaginatedUsers> => {
        const response = await api.get<ApiResponse<PaginatedUsers>>('/admin/users', {
            params: { page, limit }
        });
        return response.data.data!;
    },

    getUserById: async (id: string): Promise<AdminUserResponse> => {
        const response = await api.get<ApiResponse<AdminUserResponse>>(`/admin/users/${id}`);
        return response.data.data!;
    },

    updateUserRole: async (id: string, role: string): Promise<AdminUserResponse> => {
        const response = await api.put<ApiResponse<AdminUserResponse>>(`/admin/users/${id}/role`, { role });
        return response.data.data!;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    }
};
