import api from './api';
import type { Scan, PaginatedScans, ApiResponse } from '@/types';

export const scanService = {
    async create(file: File, barcode?: string, storeImage = true) {
        const formData = new FormData();
        formData.append('image', file);
        if (barcode) formData.append('barcode', barcode);
        formData.append('store_image', String(storeImage));

        const response = await api.post<ApiResponse<Scan>>('/scan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data!;
    },

    async list(page = 1, limit = 10): Promise<PaginatedScans> {
        const response = await api.get<ApiResponse<PaginatedScans>>('/scan', {
            params: { page, limit },
        });
        return response.data.data!;
    },

    async getById(id: string): Promise<Scan> {
        const response = await api.get<ApiResponse<Scan>>(`/scan/${id}`);
        return response.data.data!;
    },

    async getImage(id: string): Promise<string> {
        const response = await api.get<ApiResponse<{ image_url: string }>>(`/scan/${id}/image`);
        return response.data.data!.image_url;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/scan/${id}`);
    },
};
