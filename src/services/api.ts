import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { secureStorage, STORAGE_KEYS } from '../utils/secureStorage';
import type { TranslatedString } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - inject token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = secureStorage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // NOTE: We intentionally do NOT send Accept-Language header from dashboard
        // The dashboard always needs all translations for editing purposes
        // The displayLanguage setting is only used for client-side display preference

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear all storage
            secureStorage.clear();

            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?session_expired=true';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    logout: () =>
        api.get('/auth/logout'),

    getMe: () =>
        api.get('/auth/me'),

    updateMe: (formData: FormData) =>
        api.put('/auth/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    getUsers: () =>
        api.get('/auth/users'),

    register: (data: { full_name: string; email: string; password: string; phone?: string; role?: string }) =>
        api.post('/auth/register', data),

    changeUserRole: (id: string, role: string) =>
        api.put('/auth/change_user_role', { id, role }),

    deleteUser: (id: string) =>
        api.delete(`/auth/users/${id}`),

    sendOtp: (email: string) =>
        api.post('/auth/send_otp_to_email_for_change_password', { email }),

    changePassword: (email: string, otp: string, new_password: string) =>
        api.post('/auth/change_password', { email, otp, new_password }),
};

// Hero API
export const heroAPI = {
    getAll: () => api.get('/hero'),
    create: (formData: FormData) => api.post('/hero', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id: string, formData: FormData) => api.put(`/hero/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id: string) => api.delete(`/hero/${id}`),
};

// About API
export const aboutAPI = {
    get: () => api.get('/about'),
    create: (formData: FormData) => api.post('/about', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (formData: FormData) => api.put('/about', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Services API (updated for translations)
export const servicesAPI = {
    getAll: () => api.get('/services'),
    getOne: (id: string) => api.get(`/services/${id}`),
    create: (data: { title: TranslatedString; info: TranslatedString }) =>
        api.post('/services', data),
    update: (data: { id: string; title: TranslatedString; info: TranslatedString }) =>
        api.put('/services', data),
    delete: (id: string) => api.delete(`/services/${id}`),
};

// Stats API (updated for translations)
export const statsAPI = {
    getAll: () => api.get('/stats'),
    getOne: (id: string) => api.get(`/stats/${id}`),
    create: (data: { count: TranslatedString; detail: TranslatedString }) =>
        api.post('/stats', data),
    update: (data: { id: string; count: TranslatedString; detail: TranslatedString }) =>
        api.put('/stats', data),
    delete: (id: string) => api.delete(`/stats/${id}`),
};

// Projects API (updated for translations)
export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getOne: (id: string) => api.get(`/projects/${id}`),
    create: (formData: FormData) => api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (formData: FormData) => api.put('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    addImages: (projectId: string, formData: FormData) => api.post(`/projects/images/${projectId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateImage: (projectId: string, formData: FormData) => api.put(`/projects/images/${projectId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteImage: (projectId: string, imageId: string) => api.delete(`/projects/${projectId}/${imageId}`),
    delete: (id: string) => api.delete(`/projects/${id}`),
};

// Workflow API (updated for translations)
export const workflowAPI = {
    getAll: () => api.get('/workflow'),
    create: (data: { title: TranslatedString; details: TranslatedString }) =>
        api.post('/workflow', data),
    update: (data: { id: string; title: TranslatedString; details: TranslatedString }) =>
        api.put('/workflow', data),
    delete: (id: string) => api.delete(`/workflow/${id}`),
};

// Partners API (updated for translations)
export const partnersAPI = {
    getAll: () => api.get('/partners'),
    create: (formData: FormData) => api.post('/partners', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (formData: FormData) => api.put('/partners', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id: string) => api.delete(`/partners/${id}`),
};

// Testimonials API (updated - removed rating)
export const testimonialsAPI = {
    getAll: () => api.get('/testimonials'),
    create: (data: { customer_full_name: string; customer_type: TranslatedString; customer_review: TranslatedString }) =>
        api.post('/testimonials', data),
    update: (data: { id: string; customer_full_name: string; customer_type: TranslatedString; customer_review: TranslatedString }) =>
        api.put('/testimonials', data),
    delete: (id: string) => api.delete(`/testimonials/${id}`),
};

// Contact Info API (updated for translations)
export const contactInfoAPI = {
    getAll: () => api.get('/contact_info'),
    create: (data: { title: TranslatedString; detail: TranslatedString; url?: string; contact_type: string }) =>
        api.post('/contact_info', data),
    update: (data: { id: string; title: TranslatedString; detail: TranslatedString; url?: string; contact_type: string }) =>
        api.put('/contact_info', data),
    delete: (id: string) => api.delete(`/contact_info/${id}`),
};

// Socials API (not translatable)
export const socialsAPI = {
    getAll: () => api.get('/socials'),
    create: (data: { url: string; type: string }) => api.post('/socials', data),
    update: (data: { id: string; url: string; type: string }) => api.put('/socials', data),
    delete: (id: string) => api.delete(`/socials/${id}`),
};

// Map URL API (not translatable)
export const mapUrlAPI = {
    get: () => api.get('/map_url'),
    update: (data: { long: string; lat: string }) => api.put('/map_url', data),
};

// Applications API (not translatable)
export const applicationsAPI = {
    getAll: () => api.get('/applications'),
    markViewed: (id: string, is_viewed: boolean) => api.put('/applications', { id, is_viewed }),
    delete: (id: string) => api.delete(`/applications/${id}`),
};

// Languages API
export const languagesAPI = {
    getAll: () => api.get('/languages'),
    create: (data: { lang: string }) => api.post('/languages', data),
    update: (data: { id: string; lang: string }) => api.put('/languages', data),
    delete: (id: string) => api.delete(`/languages/${id}`),
};
