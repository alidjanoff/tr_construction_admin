import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI, applicationsAPI, authAPI } from '../../services/api';
import { useDeviceInfo } from '../../hooks/useDeviceInfo';
import {
    FiFolder,
    FiMail,
    FiUsers,
    FiTrendingUp,
    FiMonitor,
    FiSmartphone,
    FiTablet,
    FiMapPin,
} from 'react-icons/fi';
import Loader from '../../components/ui/Loader';
import CustomButton from '../../components/ui/CustomButton';
import './Dashboard.scss';

interface Stats {
    projects: number;
    applications: number;
    unreadApplications: number;
    users: number;
}

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isSuperAdmin } = useAuth();
    const { deviceInfo, loading: deviceLoading, requestLocation } = useDeviceInfo();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        projects: 0,
        applications: 0,
        unreadApplications: 0,
        users: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Base API calls
                const apiCalls: Promise<unknown>[] = [
                    projectsAPI.getAll(),
                    applicationsAPI.getAll(),
                ];

                // Only fetch users if superAdmin
                if (isSuperAdmin) {
                    apiCalls.push(authAPI.getUsers());
                }

                const results = await Promise.all(apiCalls);

                const projectsRes = results[0] as { data: unknown[] };
                const applicationsRes = results[1] as { data: { is_viewed: boolean }[] };
                const usersRes = isSuperAdmin ? (results[2] as { data: unknown[] }) : null;

                const applications = applicationsRes.data || [];
                const unread = applications.filter((app) => !app.is_viewed).length;

                setStats({
                    projects: Array.isArray(projectsRes.data) ? projectsRes.data.length : 0,
                    applications: applications.length,
                    unreadApplications: unread,
                    users: usersRes ? (Array.isArray(usersRes.data) ? usersRes.data.length : 0) : 0,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isSuperAdmin]);

    const getDeviceIcon = () => {
        if (!deviceInfo) return <FiMonitor />;
        switch (deviceInfo.deviceType) {
            case 'mobile': return <FiSmartphone />;
            case 'tablet': return <FiTablet />;
            default: return <FiMonitor />;
        }
    };

    const getDeviceTypeName = () => {
        if (!deviceInfo) return t('pages.dashboard.deviceInfo.deviceType.desktop');
        switch (deviceInfo.deviceType) {
            case 'mobile': return t('pages.dashboard.deviceInfo.deviceType.mobile');
            case 'tablet': return t('pages.dashboard.deviceInfo.deviceType.tablet');
            default: return t('pages.dashboard.deviceInfo.deviceType.desktop');
        }
    };

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
                <div className="stat-card clickable" onClick={() => navigate('/projects')}>
                    <div className="stat-icon projects">
                        <FiFolder />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.projects}</span>
                        <span className="stat-label">{t('sidebar.projects')}</span>
                    </div>
                </div>

                <div className="stat-card clickable" onClick={() => navigate('/applications')}>
                    <div className="stat-icon applications">
                        <FiMail />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.applications}</span>
                        <span className="stat-label">{t('sidebar.applications')}</span>
                    </div>
                </div>

                <div className="stat-card clickable" onClick={() => navigate('/applications')}>
                    <div className="stat-icon unread">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.unreadApplications}</span>
                        <span className="stat-label">{t('pages.applications.unread')}</span>
                    </div>
                </div>

                {isSuperAdmin && (
                    <div className="stat-card clickable" onClick={() => navigate('/users')}>
                        <div className="stat-icon users">
                            <FiUsers />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats.users}</span>
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

                {/* Device Information Section */}
                <div className="card device-info-card">
                    <div className="card-header">
                        <h3>
                            <span className="device-icon">{getDeviceIcon()}</span>
                            {t('pages.dashboard.deviceInfo.title')} ({getDeviceTypeName()})
                        </h3>
                    </div>
                    <div className="card-body">
                        {deviceLoading ? (
                            <Loader size="sm" />
                        ) : deviceInfo ? (
                            <div className="device-info-sections">
                                {/* Platform & OS */}
                                <div className="device-section">
                                    <h4>{t('pages.dashboard.deviceInfo.system.title')}</h4>
                                    <div className="info-list">
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.system.os')}:</span>
                                            <span className="value">{deviceInfo.os} {deviceInfo.osVersion}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.system.platform')}:</span>
                                            <span className="value">{deviceInfo.platform}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.system.deviceType')}:</span>
                                            <span className="value">{getDeviceTypeName()}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.system.deviceModel')}:</span>
                                            <span className="value">{deviceInfo.deviceVendor} {deviceInfo.deviceModel}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Browser */}
                                <div className="device-section">
                                    <h4>{t('pages.dashboard.deviceInfo.browser.title')}</h4>
                                    <div className="info-list">
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.browser.name')}:</span>
                                            <span className="value">{deviceInfo.browser}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.browser.version')}:</span>
                                            <span className="value">{deviceInfo.browserVersion}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.browser.language')}:</span>
                                            <span className="value">{deviceInfo.language}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.browser.timezone')}:</span>
                                            <span className="value">{deviceInfo.timezone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Screen */}
                                <div className="device-section">
                                    <h4>{t('pages.dashboard.deviceInfo.screen.title')}</h4>
                                    <div className="info-list">
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.screen.size')}:</span>
                                            <span className="value">{deviceInfo.screenWidth} x {deviceInfo.screenHeight} px</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.screen.pixelRatio')}:</span>
                                            <span className="value">{deviceInfo.pixelRatio}x</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.screen.colorDepth')}:</span>
                                            <span className="value">{deviceInfo.screenColorDepth} bit</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.screen.touchSupport')}:</span>
                                            <span className="value">{deviceInfo.touchSupport ? t('pages.dashboard.deviceInfo.other.yes') : t('pages.dashboard.deviceInfo.other.no')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hardware - Desktop specific */}
                                {deviceInfo.deviceType === 'desktop' && (
                                    <div className="device-section">
                                        <h4>{t('pages.dashboard.deviceInfo.hardware.title')}</h4>
                                        <div className="info-list">
                                            <div className="info-row">
                                                <span className="label">{t('pages.dashboard.deviceInfo.hardware.cpuCores')}:</span>
                                                <span className="value">{deviceInfo.hardwareConcurrency || t('pages.dashboard.deviceInfo.hardware.unknown')}</span>
                                            </div>
                                            {deviceInfo.deviceMemory > 0 && (
                                                <div className="info-row">
                                                    <span className="label">{t('pages.dashboard.deviceInfo.hardware.ram')}:</span>
                                                    <span className="value">{deviceInfo.deviceMemory} GB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Network */}
                                <div className="device-section">
                                    <h4>{t('pages.dashboard.deviceInfo.network.title')}</h4>
                                    <div className="info-list">
                                        {deviceInfo.ipAddress && (
                                            <div className="info-row">
                                                <span className="label">{t('pages.dashboard.deviceInfo.network.ipAddress')}:</span>
                                                <span className="value">{deviceInfo.ipAddress}</span>
                                            </div>
                                        )}
                                        {deviceInfo.city && (
                                            <div className="info-row">
                                                <span className="label">{t('pages.dashboard.deviceInfo.network.city')}:</span>
                                                <span className="value">{deviceInfo.city}, {deviceInfo.country}</span>
                                            </div>
                                        )}
                                        {deviceInfo.effectiveType !== 'unknown' && (
                                            <div className="info-row">
                                                <span className="label">{t('pages.dashboard.deviceInfo.network.connectionType')}:</span>
                                                <span className="value">{deviceInfo.effectiveType.toUpperCase()}</span>
                                            </div>
                                        )}
                                        {deviceInfo.downlink > 0 && (
                                            <div className="info-row">
                                                <span className="label">{t('pages.dashboard.deviceInfo.network.speed')}:</span>
                                                <span className="value">{deviceInfo.downlink} Mbps</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="device-section">
                                    <h4>
                                        <FiMapPin style={{ marginRight: '8px' }} />
                                        {t('pages.dashboard.deviceInfo.location.title')}
                                    </h4>
                                    <div className="info-list">
                                        {deviceInfo.latitude && deviceInfo.longitude ? (
                                            <>
                                                <div className="info-row">
                                                    <span className="label">{t('pages.dashboard.deviceInfo.location.coordinates')}:</span>
                                                    <span className="value">
                                                        {deviceInfo.latitude.toFixed(6)}, {deviceInfo.longitude.toFixed(6)}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="location-permission">
                                                {deviceInfo.locationError ? (
                                                    <p className="error-text">{deviceInfo.locationError}</p>
                                                ) : (
                                                    <CustomButton
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={requestLocation}
                                                    >
                                                        <FiMapPin /> {t('pages.dashboard.deviceInfo.location.getLocation')}
                                                    </CustomButton>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Other */}
                                <div className="device-section">
                                    <h4>{t('pages.dashboard.deviceInfo.other.title')}</h4>
                                    <div className="info-list">
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.other.cookies')}:</span>
                                            <span className="value">{deviceInfo.cookiesEnabled ? t('pages.dashboard.deviceInfo.other.enabled') : t('pages.dashboard.deviceInfo.other.disabled')}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.other.doNotTrack')}:</span>
                                            <span className="value">{deviceInfo.doNotTrack ? t('pages.dashboard.deviceInfo.other.enabled') : t('pages.dashboard.deviceInfo.other.disabled')}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">{t('pages.dashboard.deviceInfo.other.languages')}:</span>
                                            <span className="value">{deviceInfo.languages.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>{t('pages.dashboard.deviceInfo.loadError')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
