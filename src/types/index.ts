// Multi-Language Support
export interface MultiLang {
    az: string;
    en: string;
    [key: string]: string;
}

// User Types
export interface User {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    role: 'admin' | 'superAdmin';
    profile_image: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
}

export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'admin' | 'superAdmin';
}

export interface ChangePasswordRequest {
    email: string;
    otp: string;
    new_password: string;
}

export interface ChangeUserRoleRequest {
    id: string;
    role: 'admin' | 'superAdmin';
}

// Hero Types
export interface Hero {
    id: string;
    title: MultiLang;
    info: MultiLang;
    image_url: string;
    button_text: MultiLang;
    button_url: string;
}

// About Types
export interface About {
    title: MultiLang;
    info: MultiLang;
    description: MultiLang;
    image: string;
    our_mission: MultiLang;
    our_vision: MultiLang;
}

// Service Types
export interface Service {
    id: string;
    title: MultiLang;
    info: MultiLang;
}

// Stat Types
export interface Stat {
    id: string;
    count: MultiLang;
    detail: MultiLang;
}

// Project Types
export interface ProjectImage {
    id: string;
    image_url: string;
}

export interface Project {
    id: string;
    slug?: string;
    title: MultiLang;
    details: MultiLang;
    badge: MultiLang;
    address: MultiLang;
    map_url: string;
    cover_image: string;
    image_gallery: ProjectImage[];
}

// Workflow Types
export interface Workflow {
    id: string;
    title: MultiLang;
    details: MultiLang;
}

// Partner Types
export interface Partner {
    id: string;
    title: MultiLang;
    image: string;
}

// Testimonial Types
export interface Testimonial {
    id: string;
    customer_full_name: string;
    customer_type: MultiLang;
    customer_review: MultiLang;
}

// Contact Info Types
export interface ContactInfo {
    id: string;
    title: MultiLang;
    detail: MultiLang;
    url?: string;
    contact_type: string;
}

// Social Types
export interface Social {
    id: string;
    url: string;
    type: string;
}

// Map URL Types
export interface MapUrl {
    long: string;
    lat: string;
}

// Application Types
export interface Application {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    message: string;
    is_viewed: boolean;
}

// Language Types
export interface Language {
    id: string;
    lang: string;
}

// API Response Types
export interface ApiError {
    message: string;
}

// Helper type for form data
export type MultiLangFormData = {
    [K in keyof MultiLang]?: string;
};
