import api from './api';
import type { User, ApiResponse } from '@/types';

interface UpdateProfileData {
    name?: string;
    avatar_url?: string;
}

interface ChangePasswordData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

export const userService = {
    async getProfile(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/me');
        return response.data.data!;
    },

    async updateProfile(data: UpdateProfileData): Promise<User> {
        const response = await api.put<ApiResponse<User>>('/me', data);
        return response.data.data!;
    },

    async changePassword(data: ChangePasswordData): Promise<void> {
        await api.put('/me/password', data);
    },
};
