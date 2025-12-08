import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/types';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data.data!;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return this.login({ email: data.email, password: data.password });
    },

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return response.data.data!;
    },

    getGoogleAuthUrl(): string {
        return '/api/v1/auth/oauth/google';
    },

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },
};
