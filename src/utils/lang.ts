// import type { MultiLang } from '../types';

/**
 * Verilmiş dillərə uyğun boş MultiLang obyekti yaradır
 */
export const createEmptyMultiLang = (languages: string[]): Record<string, string> => {
    const empty: Record<string, string> = {};
    languages.forEach(lang => {
        empty[lang] = '';
    });
    return empty;
};

/**
 * Məlumatın bütün dilləri saxladığından əmin olur, yoxdursa boş string əlavə edir
 */
export const ensureMultiLang = (data: Record<string, string> | null | undefined, languages: string[]): Record<string, string> => {
    const result = { ...(data || {}) } as Record<string, string>;
    languages.forEach(lang => {
        if (result[lang] === undefined) {
            result[lang] = '';
        }
    });
    return result;
};
