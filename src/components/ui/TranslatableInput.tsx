import React, { useState, useEffect } from 'react';
import { useLanguages } from '../../contexts/LanguageContext';
import './TranslatableInput.scss';

export type TranslatedValue = Record<string, string>;

interface TranslatableInputProps {
    name: string;
    label: string;
    value: TranslatedValue;
    onChange: (value: TranslatedValue) => void;
    type?: 'input' | 'textarea';
    placeholder?: string;
    required?: boolean;
    rows?: number;
    error?: string;
    disabled?: boolean;
}

const TranslatableInput: React.FC<TranslatableInputProps> = ({
    name,
    label,
    value,
    onChange,
    type = 'input',
    placeholder,
    required = false,
    rows = 4,
    error,
    disabled = false,
}) => {
    const { languages, loading } = useLanguages();
    const [activeTab, setActiveTab] = useState<string>('');

    // Set initial active tab when languages load
    useEffect(() => {
        if (languages.length > 0 && !activeTab) {
            // Prefer 'az' as default, otherwise first language
            const defaultLang = languages.find(l => l.lang === 'az')?.lang || languages[0]?.lang;
            setActiveTab(defaultLang);
        }
    }, [languages, activeTab]);

    const handleInputChange = (lang: string, inputValue: string) => {
        onChange({
            ...value,
            [lang]: inputValue,
        });
    };

    // Get the current value for the active tab
    const currentValue = value[activeTab] || '';

    // Check if a language has content
    const hasContent = (lang: string): boolean => {
        return !!(value[lang] && value[lang].trim());
    };

    if (loading) {
        return (
            <div className="translatable-input-wrapper">
                <label>{label}{required && <span className="required">*</span>}</label>
                <div className="loading-state">Dillər yüklənir...</div>
            </div>
        );
    }

    return (
        <div className={`translatable-input-wrapper ${error ? 'has-error' : ''}`}>
            <label htmlFor={`${name}-${activeTab}`}>
                {label}
                {required && <span className="required">*</span>}
            </label>

            <div className="language-tabs">
                {languages.map((lang) => (
                    <button
                        key={lang.id}
                        type="button"
                        className={`language-tab ${activeTab === lang.lang ? 'active' : ''} ${hasContent(lang.lang) ? 'has-content' : ''}`}
                        onClick={() => setActiveTab(lang.lang)}
                        disabled={disabled}
                    >
                        {lang.lang.toUpperCase()}
                        {hasContent(lang.lang) && <span className="content-indicator">✓</span>}
                    </button>
                ))}
            </div>

            <div className="input-container">
                {type === 'textarea' ? (
                    <textarea
                        id={`${name}-${activeTab}`}
                        name={`${name}-${activeTab}`}
                        value={currentValue}
                        onChange={(e) => handleInputChange(activeTab, e.target.value)}
                        placeholder={placeholder || `${label} (${activeTab.toUpperCase()})`}
                        rows={rows}
                        required={required && activeTab === 'az'}
                        disabled={disabled}
                        className="custom-textarea"
                    />
                ) : (
                    <input
                        type="text"
                        id={`${name}-${activeTab}`}
                        name={`${name}-${activeTab}`}
                        value={currentValue}
                        onChange={(e) => handleInputChange(activeTab, e.target.value)}
                        placeholder={placeholder || `${label} (${activeTab.toUpperCase()})`}
                        required={required && activeTab === 'az'}
                        disabled={disabled}
                        className="custom-input"
                    />
                )}
            </div>

            {error && <span className="error-message">{error}</span>}

            <div className="translation-status">
                {languages.map((lang) => (
                    <span
                        key={lang.id}
                        className={`status-dot ${hasContent(lang.lang) ? 'filled' : 'empty'}`}
                        title={`${lang.lang.toUpperCase()}: ${hasContent(lang.lang) ? 'Doldurulub' : 'Boşdur'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TranslatableInput;
