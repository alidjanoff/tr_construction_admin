// Generic translation type for translatable fields
export type TranslatedString = Record<string, string>;

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
    title: TranslatedString;
    info: TranslatedString;
    images: string[];
}

// About Types
export interface About {
    title: TranslatedString;
    info: TranslatedString;
    description: TranslatedString;
    image: string;
    our_mission: TranslatedString;
    our_vision: TranslatedString;
}

// Service Types
export interface Service {
    id: string;
    title: TranslatedString;
    info: TranslatedString;
}

// Stat Types
export interface Stat {
    id: string;
    count: TranslatedString;
    detail: TranslatedString;
}

// Project Types
export interface ProjectImage {
    id: string;
    image_url: string;
}

export interface Project {
    id: string;
    title: TranslatedString;
    details: TranslatedString;
    badge: TranslatedString;
    address: TranslatedString;
    map_url: string;
    cover_image: string;
    image_gallery?: ProjectImage[];
}

// Workflow Types
export interface Workflow {
    id: string;
    title: TranslatedString;
    details: TranslatedString;
}

// Partner Types
export interface Partner {
    id: string;
    title: TranslatedString;
    image: string;
}

// Testimonial Types (removed rating)
export interface Testimonial {
    id: string;
    customer_full_name: string;
    customer_type: TranslatedString;
    customer_review: TranslatedString;
}

// Contact Info Types
export interface ContactInfo {
    id: string;
    title: TranslatedString;
    detail: TranslatedString;
    url?: string;
    contact_type: string;
}

// Social Types (not translatable)
export interface Social {
    id: string;
    url: string;
    type: string;
}

// Map URL Types (not translatable)
export interface MapUrl {
    long: string;
    lat: string;
}

// Application Types (not translatable)
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

// Helper function to create empty translation object
export const createEmptyTranslation = (languages: Language[]): TranslatedString => {
    const result: TranslatedString = {};
    languages.forEach(lang => {
        result[lang.lang] = '';
    });
    return result;
};

// Helper function to get display value from translation
export const getTranslationValue = (
    translation: TranslatedString | string | undefined,
    preferredLang: string = 'az'
): string => {
    if (!translation) return '';
    if (typeof translation === 'string') return translation;
    return translation[preferredLang] || translation['en'] || Object.values(translation)[0] || '';
};
