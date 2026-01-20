import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { socialsAPI } from '../../services/api';
import type { Social } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus, FiFacebook, FiInstagram, FiYoutube, FiLinkedin, FiTwitter, FiGlobe } from 'react-icons/fi';
import { FaTiktok, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import './CrudPage.scss';

const Socials: React.FC = () => {
    const { t } = useTranslation();
    const [socials, setSocials] = useState<Social[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Social | null>(null);
    const [formData, setFormData] = useState({ url: '', type: 'facebook' });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();

    const socialTypes = React.useMemo(() => [
        { value: 'facebook', label: 'Facebook', icon: <FiFacebook /> },
        { value: 'instagram', label: 'Instagram', icon: <FiInstagram /> },
        { value: 'youtube', label: 'YouTube', icon: <FiYoutube /> },
        { value: 'linkedin', label: 'LinkedIn', icon: <FiLinkedin /> },
        { value: 'twitter', label: 'Twitter/X', icon: <FiTwitter /> },
        { value: 'tiktok', label: 'TikTok', icon: <FaTiktok /> },
        { value: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
        { value: 'telegram', label: 'Telegram', icon: <FaTelegram /> },
        { value: 'other', label: t('common.all'), icon: <FiGlobe /> },
    ], [t]);

    const fetchData = React.useCallback(async () => {
        try {
            const response = await socialsAPI.getAll();
            setSocials(response.data || []);
        } catch {
            showToast('error', t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    }, [showToast, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({ url: '', type: 'facebook' });
        setModalOpen(true);
    };

    const handleEdit = (item: Social) => {
        setSelectedItem(item);
        setFormData({ url: item.url, type: item.type });
        setModalOpen(true);
    };

    const handleDelete = (item: Social) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.url.trim()) {
            showToast('error', t('validation.required'));
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await socialsAPI.update({
                    id: selectedItem.id,
                    url: formData.url,
                    type: formData.type,
                });
                showToast('success', t('messages.saveSuccess'));
            } else {
                await socialsAPI.create({
                    url: formData.url,
                    type: formData.type,
                });
                showToast('success', t('messages.saveSuccess'));
            }

            setModalOpen(false);
            fetchData();
        } catch {
            showToast('error', t('messages.saveError'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        setFormLoading(true);
        try {
            await socialsAPI.delete(selectedItem.id);
            showToast('success', t('messages.deleteSuccess'));
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setFormLoading(false);
        }
    };

    const getSocialTypeInfo = (type: string) => {
        return socialTypes.find(t => t.value === type) || socialTypes[socialTypes.length - 1];
    };

    const columns = [
        {
            key: 'type' as const,
            header: t('pages.socials.platform'),
            render: (item: Social) => {
                const typeInfo = getSocialTypeInfo(item.type);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {typeInfo.icon}
                        <span>{typeInfo.label}</span>
                    </div>
                );
            }
        },
        {
            key: 'url' as const,
            header: t('pages.socials.url'),
            render: (item: Social) => (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate" style={{ color: 'var(--primary)' }}>
                    {item.url.length > 50 ? item.url.slice(0, 50) + '...' : item.url}
                </a>
            )
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('pages.socials.title')}</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    {t('common.add')}
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={socials}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage={t('common.noData')}
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? t('pages.socials.editSocial') : t('pages.socials.newSocial')}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('pages.socials.platform')}</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="custom-select"
                        >
                            {socialTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <CustomInput
                        name="url"
                        label={t('pages.socials.url')}
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://..."
                        type="url"
                        required
                    />

                    <div className="button-group right">
                        <CustomButton variant="secondary" onClick={() => setModalOpen(false)}>
                            {t('common.cancel')}
                        </CustomButton>
                        <CustomButton type="submit" loading={formLoading}>
                            {selectedItem ? t('common.update') : t('common.add')}
                        </CustomButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={t('pages.socials.deleteConfirm')}
                loading={formLoading}
            />
        </div>
    );
};

export default Socials;
