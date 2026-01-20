// This module manages the display language for API requests
// It's separate from React context to be accessible in the axios interceptor

const DISPLAY_LANGUAGE_KEY = 'dashboard_display_language';

let currentDisplayLanguage: string | null = null;

// Initialize from localStorage
if (typeof window !== 'undefined') {
    currentDisplayLanguage = localStorage.getItem(DISPLAY_LANGUAGE_KEY);
}

export const getDisplayLanguage = (): string | null => {
    return currentDisplayLanguage;
};

export const setDisplayLanguage = (lang: string | null): void => {
    currentDisplayLanguage = lang;
    if (typeof window !== 'undefined') {
        if (lang) {
            localStorage.setItem(DISPLAY_LANGUAGE_KEY, lang);
        } else {
            localStorage.removeItem(DISPLAY_LANGUAGE_KEY);
        }
    }
};
