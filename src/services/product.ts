import api from './api';
import type { ApiResponse } from '@/types';

export interface Product {
    id: string;
    barcode: string;
    name?: string;
    brand?: string;
    nutrients?: {
        energy?: number;
        protein?: number;
        fat?: number;
        saturated_fat?: number;
        carbohydrate?: number;
        sugars?: number;
        fiber?: number;
        sodium?: number;
        salt?: number;
    };
    nutri_score?: string;
    nutri_score_value?: number;
    serving_size?: string;
    source: string;
    created_at: string;
    updated_at: string;
}

export const productService = {
    async getByBarcode(barcode: string): Promise<Product> {
        const response = await api.get<ApiResponse<Product>>(`/product/${barcode}`);
        return response.data.data!;
    },
};
