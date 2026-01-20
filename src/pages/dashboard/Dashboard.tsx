import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI, applicationsAPI } from '../../services/api';
import {
    FiFolder,
    FiMail,
    FiUsers,
    FiTrendingUp,
} from 'react-icons/fi';
import Loader from '../../components/ui/Loader';
import './Dashboard.scss';

interface Stats {
    projects: number;
    applications: number;
    unreadApplications: number;
}

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const { user, isSuperAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        projects: 0,
        applications: 0,
        unreadApplications: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [projectsRes, applicationsRes] = await Promise.all([
                    projectsAPI.getAll(),
                    applicationsAPI.getAll(),
                ]);

                const applications = applicationsRes.data || [];
                const unread = applications.filter((app: { is_viewed: boolean }) => !app.is_viewed).length;

                setStats({
                    projects: projectsRes.data?.length || 0,
                    applications: applications.length,
                    unreadApplications: unread,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="page-content">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="page-content dashboard">
            <div className="welcome-section">
                <h2>{t('pages.dashboard.welcome')}, {user?.full_name}!</h2>
                <p className="role-badge">
                    {isSuperAdmin ? t('pages.users.roles.superAdmin') : t('pages.users.roles.admin')}
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <FiFolder />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.projects}</span>
                        <span className="stat-label">{t('sidebar.projects')}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon applications">
                        <FiMail />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.applications}</span>
                        <span className="stat-label">{t('sidebar.applications')}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon unread">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.unreadApplications}</span>
                        <span className="stat-label">{t('pages.applications.unread')}</span>
                    </div>
                </div>

                {isSuperAdmin && (
                    <div className="stat-card">
                        <div className="stat-icon users">
                            <FiUsers />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">-</span>
                            <span className="stat-label">{t('sidebar.users')}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="quick-info">
                <div className="card">
                    <div className="card-header">
                        <h3>{t('pages.dashboard.systemInfo')}</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">{t('auth.email')}:</span>
                                <span className="info-value">{user?.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">{t('pages.users.role')}:</span>
                                <span className="info-value">{user?.role}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">API Status:</span>
                                <span className="badge success">{t('pages.dashboard.active')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
