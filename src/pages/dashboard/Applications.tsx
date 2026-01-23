import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { applicationsAPI } from '../../services/api';
import type { Application } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomButton from '../../components/ui/CustomButton';
import { FiMail, FiPhone, FiUser, FiMessageCircle, FiCheck, FiSearch } from 'react-icons/fi';
import './CrudPage.scss';
import './Applications.scss';

type SortOrder = 'az' | 'za' | 'default';
type ViewedFilter = 'all' | 'viewed' | 'unread';
type SearchField = 'full_name' | 'email' | 'phone';

const Applications: React.FC = () => {
    const { t } = useTranslation();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Filter and search state
    const [sortOrder, setSortOrder] = useState<SortOrder>('default');
    const [viewedFilter, setViewedFilter] = useState<ViewedFilter>('all');
    const [searchField, setSearchField] = useState<SearchField>('full_name');
    const [searchQuery, setSearchQuery] = useState('');

    const { showToast } = useToast();

    const fetchApplications = async () => {
        try {
            const response = await applicationsAPI.getAll();
            setApplications(response.data || []);
        } catch {
            showToast('error', t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationsCallback = React.useCallback(fetchApplications, [showToast, t]);

    useEffect(() => {
        fetchApplicationsCallback();
    }, [fetchApplicationsCallback]);

    // Filtered and sorted applications
    const filteredApplications = useMemo(() => {
        let result = [...applications];

        // Apply viewed filter
        if (viewedFilter === 'viewed') {
            result = result.filter(app => app.is_viewed);
        } else if (viewedFilter === 'unread') {
            result = result.filter(app => !app.is_viewed);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(app => {
                const fieldValue = app[searchField]?.toLowerCase() || '';
                return fieldValue.includes(query);
            });
        }

        // Apply sort
        if (sortOrder === 'az') {
            result.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        } else if (sortOrder === 'za') {
            result.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
        }

        return result;
    }, [applications, sortOrder, viewedFilter, searchField, searchQuery]);

    const handleView = async (app: Application) => {
        setSelectedApp(app);
        setViewModalOpen(true);

        // Mark as viewed if not already
        if (!app.is_viewed) {
            try {
                await applicationsAPI.markViewed(app.id, true);
                fetchApplications();
            } catch {
                console.error('Failed to mark as viewed');
            }
        }
    };

    const handleDelete = (app: Application) => {
        setSelectedApp(app);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedApp) return;

        setFormLoading(true);
        try {
            await applicationsAPI.delete(selectedApp.id);
            showToast('success', t('messages.deleteSuccess'));
            setDeleteDialogOpen(false);
            fetchApplications();
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'is_viewed' as const,
            header: '',
            width: '40px',
            render: (app: Application) => (
                <span
                    className={`status-dot ${app.is_viewed ? 'viewed' : 'unread'}`}
                    title={app.is_viewed ? t('common.yes') : t('common.no')}
                />
            ),
        },
        { key: 'full_name' as const, header: t('pages.applications.name') },
        { key: 'email' as const, header: t('pages.applications.email') },
        { key: 'phone' as const, header: t('pages.applications.phone') },
        {
            key: 'message' as const,
            header: t('pages.applications.message'),
            render: (app: Application) => (
                <span className="truncate">{app.message.slice(0, 50)}...</span>
            ),
        },
    ];

    const unreadCount = applications.filter((a) => !a.is_viewed).length;

    return (
        <div className="page-content crud-page applications-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('pages.applications.title')}</h1>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount} {t('pages.applications.unread').toLowerCase()}</span>
                    )}
                </div>
            </div>

            {/* Filter and Search Section */}
            <div className="filter-search-section">
                {/* Sort Filter */}
                <div className="filter-group">
                    <label>{t('pages.applications.sort')}</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="custom-select"
                    >
                        <option value="default">{t('pages.applications.sortDefault')}</option>
                        <option value="az">{t('pages.applications.sortAZ')}</option>
                        <option value="za">{t('pages.applications.sortZA')}</option>
                    </select>
                </div>

                {/* Viewed Status Filter */}
                <div className="filter-group">
                    <label>{t('pages.applications.status')}</label>
                    <select
                        value={viewedFilter}
                        onChange={(e) => setViewedFilter(e.target.value as ViewedFilter)}
                        className="custom-select"
                    >
                        <option value="all">{t('pages.applications.filterAll')}</option>
                        <option value="viewed">{t('pages.applications.filterRead')}</option>
                        <option value="unread">{t('pages.applications.filterUnread')}</option>
                    </select>
                </div>

                {/* Search Field Select */}
                <div className="filter-group">
                    <label>{t('pages.applications.searchBy')}</label>
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value as SearchField)}
                        className="custom-select"
                    >
                        <option value="full_name">{t('pages.applications.searchByName')}</option>
                        <option value="email">{t('pages.applications.searchByEmail')}</option>
                        <option value="phone">{t('pages.applications.searchByPhone')}</option>
                    </select>
                </div>

                {/* Search Input */}
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                            searchField === 'full_name'
                                ? t('pages.applications.enterName')
                                : searchField === 'email'
                                    ? t('pages.applications.enterEmail')
                                    : t('pages.applications.enterPhone')
                        }
                        className="search-input"
                    />
                </div>

                <span className="results-count">
                    {filteredApplications.length} / {applications.length}
                </span>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={filteredApplications}
                    loading={loading}
                    onView={handleView}
                    onDelete={handleDelete}
                    emptyMessage={searchQuery || viewedFilter !== 'all' ? t('pages.applications.noResults') : t('common.noData')}
                />
            </div>

            <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title={t('pages.applications.viewDetails')}
                size="md"
            >
                {selectedApp && (
                    <div className="application-details">
                        <div className="detail-row">
                            <FiUser />
                            <div>
                                <span className="label">{t('pages.applications.name')}</span>
                                <span className="value">{selectedApp.full_name}</span>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiMail />
                            <div>
                                <span className="label">{t('pages.applications.email')}</span>
                                <a href={`mailto:${selectedApp.email}`} className="value link">
                                    {selectedApp.email}
                                </a>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiPhone />
                            <div>
                                <span className="label">{t('pages.applications.phone')}</span>
                                <a href={`tel:${selectedApp.phone}`} className="value link">
                                    {selectedApp.phone}
                                </a>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiMessageCircle />
                            <div>
                                <span className="label">{t('pages.applications.message')}</span>
                                <p className="value message">{selectedApp.message}</p>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiCheck />
                            <div>
                                <span className="label">{t('pages.applications.status')}</span>
                                <span className={`badge ${selectedApp.is_viewed ? 'success' : 'warning'}`}>
                                    {selectedApp.is_viewed ? t('common.allLanguages') : t('pages.applications.unread')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="button-group right" style={{ marginTop: '24px' }}>
                    <CustomButton variant="secondary" onClick={() => setViewModalOpen(false)}>
                        {t('common.close')}
                    </CustomButton>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={t('pages.applications.deleteConfirm')}
                loading={formLoading}
            />
        </div>
    );
};

export default Applications;
