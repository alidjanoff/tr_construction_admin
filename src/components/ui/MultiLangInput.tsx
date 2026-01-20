import React, { useState } from 'react';
// import type { MultiLang } from '../../types';
import './MultiLangInput.scss';

interface MultiLangInputProps {
    label: string;
    name: string;
    // value: MultiLang;
    value: any;
    onChange: (value: any) => void;
    // onChange: (value: MultiLang) => void;
    placeholder?: string;
    required?: boolean;
    type?: 'input' | 'textarea';
    rows?: number;
    languages?: string[];
}

const MultiLangInput: React.FC<MultiLangInputProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder = '',
    required = false,
    type = 'input',
    rows = 4,
    languages = ['az', 'en'],
}) => {
    const [activeLang, setActiveLang] = useState(languages[0]);

    const handleChange = (lang: string, newValue: string) => {
        onChange({
            ...value,
            [lang]: newValue,
        });
    };

    const getLangLabel = (lang: string) => {
        const labels: { [key: string]: string } = {
            az: 'AZ',
            en: 'EN',
            ru: 'RU',
            tr: 'TR',
        };
        return labels[lang] || lang.toUpperCase();
    };

    return (
        <div className="multi-lang-input">
            <div className="multi-lang-header">
                <label>{label}{required && <span className="required">*</span>}</label>
                <div className="lang-tabs">
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            className={`lang-tab ${activeLang === lang ? 'active' : ''}`}
                            onClick={() => setActiveLang(lang)}
                        >
                            {getLangLabel(lang)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="multi-lang-content">
                {type === 'textarea' ? (
                    <textarea
                        name={`${name}_${activeLang}`}
                        value={value[activeLang] || ''}
                        onChange={(e) => handleChange(activeLang, e.target.value)}
                        placeholder={`${placeholder} (${getLangLabel(activeLang)})`}
                        rows={rows}
                        className="custom-textarea"
                        required={required && activeLang === languages[0]}
                    />
                ) : (
                    <input
                        type="text"
                        name={`${name}_${activeLang}`}
                        value={value[activeLang] || ''}
                        onChange={(e) => handleChange(activeLang, e.target.value)}
                        placeholder={`${placeholder} (${getLangLabel(activeLang)})`}
                        className="custom-input"
                        required={required && activeLang === languages[0]}
                    />
                )}
            </div>
        </div>
    );
};

export default MultiLangInput;
