import React, { useState, useEffect } from 'react';
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
                <h2>Xoş gəldiniz, {user?.full_name}!</h2>
                <p className="role-badge">
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <FiFolder />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.projects}</span>
                        <span className="stat-label">Layihələr</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon applications">
                        <FiMail />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.applications}</span>
                        <span className="stat-label">Müraciətlər</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon unread">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.unreadApplications}</span>
                        <span className="stat-label">Oxunmamış Müraciət</span>
                    </div>
                </div>

                {isSuperAdmin && (
                    <div className="stat-card">
                        <div className="stat-icon users">
                            <FiUsers />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">-</span>
                            <span className="stat-label">İstifadəçilər</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="quick-info">
                <div className="card">
                    <div className="card-header">
                        <h3>Sistem Məlumatları</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Admin Email:</span>
                                <span className="info-value">{user?.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Rol:</span>
                                <span className="info-value">{user?.role}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">API Status:</span>
                                <span className="badge success">Aktiv</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
