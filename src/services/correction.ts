import api from './api';
import type { ApiResponse } from '@/types';

export interface Correction {
    id: string;
    scan_id: string;
    field_name: string;
    original_value?: string;
    corrected_value: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface CreateCorrectionRequest {
    field_name: string;
    corrected_value: string;
}

export const correctionService = {
    async submitCorrection(scanId: string, fieldName: string, correctedValue: string): Promise<Correction> {
        const response = await api.post<ApiResponse<Correction>>(`/scan/${scanId}/correct`, {
            field_name: fieldName,
            corrected_value: correctedValue,
        });
        return response.data.data!;
    },

    async getCorrections(scanId: string): Promise<Correction[]> {
        const response = await api.get<ApiResponse<Correction[]>>(`/scan/${scanId}/corrections`);
        return response.data.data || [];
    },
};
