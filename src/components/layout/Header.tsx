import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguages } from '../../contexts/LanguageContext';
import { FiMenu, FiUser, FiLogOut, FiChevronDown, FiGlobe } from 'react-icons/fi';
import './Header.scss';

interface HeaderProps {
    pageTitle: string;
    onMobileMenuToggle: () => void;
}

// Language display names
const languageNames: Record<string, string> = {
    az: 'Azərbaycan',
    en: 'English',
    tr: 'Türkçe',
    ru: 'Русский',
    de: 'Deutsch',
    fr: 'Français',
};

const Header: React.FC<HeaderProps> = ({ pageTitle, onMobileMenuToggle }) => {
    const { user, logout } = useAuth();
    const { languages, displayLanguage, setDisplayLanguage } = useLanguages();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const handleLanguageSelect = (lang: string | null) => {
        setDisplayLanguage(lang);
        setIsLangDropdownOpen(false);
    };

    const getLanguageName = (lang: string): string => {
        return languageNames[lang] || lang.toUpperCase();
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="mobile-menu-btn" onClick={onMobileMenuToggle}>
                    <FiMenu />
                </button>
                <h1 className="header-title">{pageTitle}</h1>
            </div>

            <div className="header-right">
                {/* Language Selector */}
                <div className="lang-selector" ref={langDropdownRef}>
                    <button
                        className="lang-selector-btn"
                        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    >
                        <FiGlobe />
                        <span className="lang-label">
                            {displayLanguage ? displayLanguage.toUpperCase() : 'ALL'}
                        </span>
                        <FiChevronDown className={`dropdown-icon ${isLangDropdownOpen ? 'open' : ''}`} />
                    </button>

                    {isLangDropdownOpen && (
                        <div className="lang-dropdown">
                            <button
                                className={`dropdown-item ${!displayLanguage ? 'active' : ''}`}
                                onClick={() => handleLanguageSelect(null)}
                            >
                                <span className="lang-code">ALL</span>
                                <span className="lang-name">Bütün dillər</span>
                            </button>
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    className={`dropdown-item ${displayLanguage === lang.lang ? 'active' : ''}`}
                                    onClick={() => handleLanguageSelect(lang.lang)}
                                >
                                    <span className="lang-code">{lang.lang.toUpperCase()}</span>
                                    <span className="lang-name">{getLanguageName(lang.lang)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="user-menu" ref={dropdownRef}>
                    <button
                        className="user-menu-btn"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {user?.profile_image ? (
                            <img src={user.profile_image} alt={user.full_name} className="user-avatar" />
                        ) : (
                            <div className="user-avatar-placeholder">
                                <FiUser />
                            </div>
                        )}
                        <div className="user-info">
                            <span className="user-name">{user?.full_name}</span>
                            <span className={`user-role ${user?.role}`}>
                                {user?.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                            </span>
                        </div>
                        <FiChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="user-dropdown">
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <FiLogOut />
                                <span>Çıxış</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
