import { useLanguages } from '../contexts/LanguageContext';
import type { TranslatedString } from '../types';

/**
 * Hook to get display text based on selected display language
 * Returns a helper function that extracts the correct translation
 */
export const useDisplayText = () => {
    const { displayLanguage } = useLanguages();

    /**
     * Get text in the selected display language
     * @param translations - Object with language keys (e.g., { az: "...", en: "..." })
     * @param fallback - Default value if no translation found
     * @returns The translated text for the selected language
     */
    const getDisplayText = (
        translations: TranslatedString | string | undefined | null,
        fallback: string = ''
    ): string => {
        if (!translations) return fallback;

        // If it's already a string, return it
        if (typeof translations === 'string') return translations;

        // If a display language is selected, try to get that specific translation
        if (displayLanguage && translations[displayLanguage]) {
            return translations[displayLanguage];
        }

        // Otherwise return first available (prefer az, then en, then any)
        return translations.az || translations.en || Object.values(translations)[0] || fallback;
    };

    return { getDisplayText, displayLanguage };
};

/**
 * Standalone function version (for use outside of React components)
 * Note: This won't react to language changes without re-render
 */
export const getDisplayTextStatic = (
    translations: TranslatedString | string | undefined | null,
    displayLanguage: string | null,
    fallback: string = ''
): string => {
    if (!translations) return fallback;

    if (typeof translations === 'string') return translations;

    if (displayLanguage && translations[displayLanguage]) {
        return translations[displayLanguage];
    }

    return translations.az || translations.en || Object.values(translations)[0] || fallback;
};
