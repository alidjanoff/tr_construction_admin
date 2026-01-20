// import type { MultiLang } from '../types';

/**
 * Verilmiş dillərə uyğun boş MultiLang obyekti yaradır
 */
// export const createEmptyMultiLang = (languages: string[]): MultiLang => {
export const createEmptyMultiLang = (languages: string[]): any => {
    const empty: any = {};
    languages.forEach(lang => {
        empty[lang] = '';
    });
    // return empty as MultiLang;
    return empty as any;
};

/**
 * Məlumatın bütün dilləri saxladığından əmin olur, yoxdursa boş string əlavə edir
 */
// export const ensureMultiLang = (data: any, languages: string[]): MultiLang => {
export const ensureMultiLang = (data: any, languages: string[]): any => {
    const result = {...(data || {})};
    languages.forEach(lang => {
        if (result[lang] === undefined) {
            result[lang] = '';
        }
    });
    // return result as MultiLang;
    return result as any;
};
