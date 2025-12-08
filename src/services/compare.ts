import api from './api';
import type { CompareRequest, CompareResponse, ApiResponse } from '@/types';

export const compareService = {
    async compare(data: CompareRequest): Promise<CompareResponse> {
        const response = await api.post<ApiResponse<CompareResponse>>('/compare', data);
        return response.data.data!;
    },
};
