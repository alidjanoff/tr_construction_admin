import type { MultiLang } from '../types';

/**
 * Verilmiş dillərə uyğun boş MultiLang obyekti yaradır
 */
export const createEmptyMultiLang = (languages: string[]): MultiLang => {
    const empty: any = {};
    languages.forEach(lang => {
        empty[lang] = '';
    });
    return empty as MultiLang;
};

/**
 * Məlumatın bütün dilləri saxladığından əmin olur, yoxdursa boş string əlavə edir
 */
export const ensureMultiLang = (data: any, languages: string[]): MultiLang => {
    const result = { ...(data || {}) };
    languages.forEach(lang => {
        if (result[lang] === undefined) {
            result[lang] = '';
        }
    });
    return result as MultiLang;
};
