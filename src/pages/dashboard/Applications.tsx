import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { applicationsAPI } from '../../services/api';
import type { Application } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomButton from '../../components/ui/CustomButton';
import { FiMail, FiPhone, FiUser, FiMessageCircle, FiCheck } from 'react-icons/fi';
import './CrudPage.scss';
import './Applications.scss';

const Applications: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();

    const fetchApplications = async () => {
        try {
            const response = await applicationsAPI.getAll();
            setApplications(response.data || []);
        } catch (error) {
            showToast('error', 'Müraciətlər yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleView = async (app: Application) => {
        setSelectedApp(app);
        setViewModalOpen(true);

        // Mark as viewed if not already
        if (!app.is_viewed) {
            try {
                await applicationsAPI.markViewed(app.id, true);
                fetchApplications();
            } catch (error) {
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
            showToast('success', 'Müraciət silindi');
            setDeleteDialogOpen(false);
            fetchApplications();
        } catch (error) {
            showToast('error', 'Müraciət silinə bilmədi');
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
                <span className={`status-dot ${app.is_viewed ? 'viewed' : 'unread'}`} title={app.is_viewed ? 'Oxunub' : 'Yeni'} />
            ),
        },
        { key: 'full_name' as const, header: 'Ad Soyad' },
        { key: 'email' as const, header: 'Email' },
        { key: 'phone' as const, header: 'Telefon' },
        {
            key: 'message' as const,
            header: 'Mesaj',
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
                    <h1 className="page-title">Müraciətlər</h1>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount} yeni müraciət</span>
                    )}
                </div>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={applications}
                    loading={loading}
                    onView={handleView}
                    onDelete={handleDelete}
                    emptyMessage="Müraciət tapılmadı"
                />
            </div>

            <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Müraciət Detalları"
                size="md"
            >
                {selectedApp && (
                    <div className="application-details">
                        <div className="detail-row">
                            <FiUser />
                            <div>
                                <span className="label">Ad Soyad</span>
                                <span className="value">{selectedApp.full_name}</span>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiMail />
                            <div>
                                <span className="label">Email</span>
                                <a href={`mailto:${selectedApp.email}`} className="value link">
                                    {selectedApp.email}
                                </a>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiPhone />
                            <div>
                                <span className="label">Telefon</span>
                                <a href={`tel:${selectedApp.phone}`} className="value link">
                                    {selectedApp.phone}
                                </a>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiMessageCircle />
                            <div>
                                <span className="label">Mesaj</span>
                                <p className="value message">{selectedApp.message}</p>
                            </div>
                        </div>
                        <div className="detail-row">
                            <FiCheck />
                            <div>
                                <span className="label">Status</span>
                                <span className={`badge ${selectedApp.is_viewed ? 'success' : 'warning'}`}>
                                    {selectedApp.is_viewed ? 'Oxunub' : 'Yeni'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="button-group right" style={{ marginTop: '24px' }}>
                    <CustomButton variant="secondary" onClick={() => setViewModalOpen(false)}>
                        Bağla
                    </CustomButton>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={`Bu müraciəti silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Applications;
