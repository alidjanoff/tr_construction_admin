import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    FiHome,
    FiImage,
    FiInfo,
    FiSettings,
    FiLayers,
    FiBarChart2,
    FiFolder,
    FiGitBranch,
    FiUsers,
    FiStar,
    FiPhone,
    FiShare2,
    FiMapPin,
    FiMail,
    FiGlobe,
    FiUserPlus,
    FiChevronLeft,
    FiChevronRight,
    FiUser,
} from 'react-icons/fi';
import logo from '../../assets/images/logo.jpeg';
import './Sidebar.scss';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
    superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
    { path: '/', icon: <FiHome />, label: 'Ana Səhifə' },
    { path: '/profile', icon: <FiUser />, label: 'Profil' },
    { path: '/hero', icon: <FiImage />, label: 'Hero' },
    { path: '/about', icon: <FiInfo />, label: 'Haqqımızda' },
    { path: '/services', icon: <FiSettings />, label: 'Xidmətlər' },
    { path: '/stats', icon: <FiBarChart2 />, label: 'Statistika' },
    { path: '/projects', icon: <FiFolder />, label: 'Layihələr' },
    { path: '/workflow', icon: <FiGitBranch />, label: 'İş Axını' },
    { path: '/partners', icon: <FiLayers />, label: 'Partnyorlar' },
    { path: '/testimonials', icon: <FiStar />, label: 'Rəylər' },
    { path: '/contact-info', icon: <FiPhone />, label: 'Əlaqə' },
    { path: '/socials', icon: <FiShare2 />, label: 'Sosial' },
    { path: '/map-url', icon: <FiMapPin />, label: 'Xəritə' },
    { path: '/applications', icon: <FiMail />, label: 'Müraciətlər' },
    { path: '/languages', icon: <FiGlobe />, label: 'Dillər' },
];

const superAdminNavItems: NavItem[] = [
    { path: '/users', icon: <FiUsers />, label: 'İstifadəçilər', superAdminOnly: true },
    { path: '/users/new', icon: <FiUserPlus />, label: 'Yeni İstifadəçi', superAdminOnly: true },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const { isSuperAdmin } = useAuth();
    const location = useLocation();

    const allNavItems = isSuperAdmin ? [...navItems, ...superAdminNavItems] : navItems;

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <img src={logo} alt="TR Construction" className="sidebar-logo" />
                {!isCollapsed && <span className="sidebar-title">TR Construction</span>}
            </div>

            <nav className="sidebar-nav">
                {allNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive || (item.path === '/' && location.pathname === '/') ? 'active' : ''}`
                        }
                        end={item.path === '/'}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <button className="sidebar-toggle" onClick={onToggle}>
                {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
        </aside>
    );
};

export default Sidebar;
