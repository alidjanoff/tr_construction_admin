import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { languagesAPI } from '../services/api';
import type { Language } from '../types';

interface LanguageContextType {
    languages: Language[];
    loading: boolean;
    refreshLanguages: () => Promise<void>;
    getDefaultLanguage: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <LanguageContext.Provider value={{ languages, loading, refreshLanguages, getDefaultLanguage }}>
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
