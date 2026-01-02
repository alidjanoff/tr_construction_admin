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
    title: string;
    subtitle: string;
    background_image: string;
}

// About Types
export interface About {
    id: string;
    title: string;
    description: string;
    image: string;
    experience_years: number;
    projects_completed: number;
}

// Service Types
export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
}

// Stat Types
export interface Stat {
    id: string;
    title: string;
    value: string;
    icon: string;
}

// Project Types
export interface ProjectImage {
    id: string;
    image_url: string;
}

export interface Project {
    id: string;
    title: string;
    details: string;
    badge: string;
    address: string;
    map_url: string;
    cover_image: string;
    image_gallery: ProjectImage[];
}

// Workflow Types
export interface Workflow {
    id: string;
    title: string;
    details: string;
}

// Partner Types
export interface Partner {
    id: string;
    title: string;
    image: string;
}

// Testimonial Types
export interface Testimonial {
    id: string;
    customer_full_name: string;
    customer_type: string;
    customer_review: string;
    rating: number;
}

// Contact Info Types
export interface ContactInfo {
    id: string;
    title: string;
    detail: string;
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
