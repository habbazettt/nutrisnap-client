// =============== AUTH TYPES ===============

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar_url?: string;
    email_verified_at?: string;
    created_at: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_at: string;
}

// =============== SCAN TYPES ===============

export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Nutrients {
    energy_kcal?: number;
    fat?: number;
    saturated_fat?: number;
    carbohydrates?: number;
    sugars?: number;
    fiber?: number;
    protein?: number;
    sodium?: number;
    salt?: number;
}

export type HighlightLevel = 'low' | 'medium' | 'high';

export interface NutrientHighlight {
    name: string;
    value: number;
    unit: string;
    level: HighlightLevel;
    message: string;
}

export type InsightType = 'positive' | 'negative' | 'neutral' | 'warning';

export interface Insight {
    type: InsightType;
    title: string;
    message: string;
}

export interface Scan {
    id: string;
    user_id?: string;
    barcode?: string;
    status: ScanStatus;
    image_url?: string;
    serving_size?: string;
    nutri_score?: string;
    nutri_score_value?: number;
    nutrients?: Nutrients;
    highlights?: NutrientHighlight[];
    insights?: Insight[];
    processing_time_ms?: number;
    error_message?: string;
    created_at: string;
}

export interface PaginatedScans {
    scans: Scan[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

// =============== COMPARE TYPES ===============

export interface CompareRequest {
    product_a: string;
    product_b: string;
}

export interface ProductSummary {
    id: string;
    name: string;
    barcode?: string;
    nutri_score?: string;
    image_url?: string;
}

export interface NutrientComparison {
    name: string;
    value_a?: number;
    value_b?: number;
    unit: string;
    difference?: number;
    winner: 'a' | 'b' | 'tie';
    note?: string;
}

export interface CompareResponse {
    product_a: ProductSummary;
    product_b: ProductSummary;
    comparisons: NutrientComparison[];
    winner: 'a' | 'b' | 'tie';
    verdict: string;
}

// =============== API RESPONSE ===============

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// =============== ADMIN TYPES ===============

export interface AdminStats {
    total_users: number;
    total_scans: number;
    total_products: number;
    active_users: number;
}

export interface AdminUserResponse {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: 'user' | 'admin';
    email_verified_at?: string;
    has_password?: boolean;
    has_google_linked?: boolean;
    created_at: string;
}

export interface PaginatedUsers {
    users: AdminUserResponse[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface UpdateUserRoleRequest {
    role: 'user' | 'admin';
}
