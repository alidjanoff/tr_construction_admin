import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { languagesAPI } from '../services/api';
import { getDisplayLanguage, setDisplayLanguage as setDisplayLang } from '../utils/displayLanguage';
import type { Language } from '../types';

interface LanguageContextType {
    languages: Language[];
    loading: boolean;
    refreshLanguages: () => Promise<void>;
    getDefaultLanguage: () => string;
    // Display language for viewing content
    displayLanguage: string | null;
    setDisplayLanguage: (lang: string | null) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { i18n } = useTranslation();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayLanguage, setDisplayLanguageState] = useState<string | null>(() => {
        // Load from utils module on init
        return getDisplayLanguage();
    });

    const fetchLanguages = async () => {
        try {
            const response = await languagesAPI.getAll();
            setLanguages(response.data || []);
        } catch (error) {
            console.error('Failed to fetch languages:', error);
            // Fallback to default languages if API fails
            setLanguages([
                { id: 'default-az', lang: 'az' },
                { id: 'default-en', lang: 'en' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const refreshLanguages = async () => {
        setLoading(true);
        await fetchLanguages();
    };

    const getDefaultLanguage = (): string => {
        if (languages.length === 0) return 'en';
        // Prefer 'az' as default, otherwise first language
        const azLang = languages.find(l => l.lang === 'az');
        return azLang ? 'az' : languages[0].lang;
    };

    const setDisplayLanguage = (lang: string | null) => {
        setDisplayLanguageState(lang);
        setDisplayLang(lang); // Sync with utils module for axios interceptor

        // Change i18n language for static text translations
        if (lang) {
            i18n.changeLanguage(lang);
        } else {
            // If null (ALL), use 'az' as default for UI
            i18n.changeLanguage('az');
        }
    };

    return (
        <LanguageContext.Provider value={{
            languages,
            loading,
            refreshLanguages,
            getDefaultLanguage,
            displayLanguage,
            setDisplayLanguage
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguages = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguages must be used within a LanguageProvider');
    }
    return context;
};
