import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.scss';

// Map routes to page titles
const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/profile': 'Profil',
    '/hero': 'Hero Bölməsi',
    '/about': 'Haqqımızda',
    '/services': 'Xidmətlər',
    '/stats': 'Statistika',
    '/projects': 'Layihələr',
    '/workflow': 'İş Axını',
    '/partners': 'Partnyorlar',
    '/testimonials': 'Müştəri Rəyləri',
    '/contact-info': 'Əlaqə Məlumatları',
    '/socials': 'Sosial Şəbəkələr',
    '/map-url': 'Xəritə Koordinatları',
    '/applications': 'Müraciətlər',
    '/languages': 'Dillər',
    '/users': 'İstifadəçilər',
    '/users/new': 'Yeni İstifadəçi',
};

const MainLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            {isMobileMenuOpen && (
                <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            <div className="main-wrapper">
                <Header pageTitle={pageTitle} onMobileMenuToggle={toggleMobileMenu} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
