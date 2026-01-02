import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import './Header.scss';

interface HeaderProps {
    pageTitle: string;
    onMobileMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onMobileMenuToggle }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
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
