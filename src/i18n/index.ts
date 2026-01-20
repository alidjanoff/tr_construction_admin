import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import azTranslation from '../../public/locales/az/translation.json';
import enTranslation from '../../public/locales/en/translation.json';
import trTranslation from '../../public/locales/tr/translation.json';

// Get saved language or default to 'az'
const savedLanguage = localStorage.getItem('displayLanguage') || 'az';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            az: { translation: azTranslation },
            en: { translation: enTranslation },
            tr: { translation: trTranslation },
        },
        lng: savedLanguage, // Default language
        fallbackLng: 'az', // Fallback language
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        react: {
            useSuspense: false, // Disable suspense for SSR compatibility
        },
    });

export default i18n;
