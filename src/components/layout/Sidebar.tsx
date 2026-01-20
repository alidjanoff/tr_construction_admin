import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    labelKey: string;
    superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
    { path: '/', icon: <FiHome />, labelKey: 'sidebar.dashboard' },
    { path: '/profile', icon: <FiUser />, labelKey: 'sidebar.profile' },
    { path: '/hero', icon: <FiImage />, labelKey: 'sidebar.hero' },
    { path: '/about', icon: <FiInfo />, labelKey: 'sidebar.about' },
    { path: '/services', icon: <FiSettings />, labelKey: 'sidebar.services' },
    { path: '/stats', icon: <FiBarChart2 />, labelKey: 'sidebar.stats' },
    { path: '/projects', icon: <FiFolder />, labelKey: 'sidebar.projects' },
    { path: '/workflow', icon: <FiGitBranch />, labelKey: 'sidebar.workflow' },
    { path: '/partners', icon: <FiLayers />, labelKey: 'sidebar.partners' },
    { path: '/testimonials', icon: <FiStar />, labelKey: 'sidebar.testimonials' },
    { path: '/contact-info', icon: <FiPhone />, labelKey: 'sidebar.contact' },
    { path: '/socials', icon: <FiShare2 />, labelKey: 'sidebar.socials' },
    { path: '/map-url', icon: <FiMapPin />, labelKey: 'sidebar.mapUrl' },
    { path: '/applications', icon: <FiMail />, labelKey: 'sidebar.applications' },
    { path: '/languages', icon: <FiGlobe />, labelKey: 'sidebar.languages' },
];

const superAdminNavItems: NavItem[] = [
    { path: '/users', icon: <FiUsers />, labelKey: 'sidebar.users', superAdminOnly: true },
    { path: '/users/new', icon: <FiUserPlus />, labelKey: 'pages.users.newUser', superAdminOnly: true },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const { t } = useTranslation();
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
                        {!isCollapsed && <span className="nav-label">{t(item.labelKey)}</span>}
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
