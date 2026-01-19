import React, { useState, useEffect } from 'react';
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

const socialTypes = [
    { value: 'facebook', label: 'Facebook', icon: <FiFacebook /> },
    { value: 'instagram', label: 'Instagram', icon: <FiInstagram /> },
    { value: 'youtube', label: 'YouTube', icon: <FiYoutube /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <FiLinkedin /> },
    { value: 'twitter', label: 'Twitter/X', icon: <FiTwitter /> },
    { value: 'tiktok', label: 'TikTok', icon: <FaTiktok /> },
    { value: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
    { value: 'telegram', label: 'Telegram', icon: <FaTelegram /> },
    { value: 'other', label: 'Digər', icon: <FiGlobe /> },
];

const Socials: React.FC = () => {
    const [socials, setSocials] = useState<Social[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Social | null>(null);
    const [formData, setFormData] = useState({ url: '', type: 'facebook' });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();

    const fetchData = async () => {
        try {
            const response = await socialsAPI.getAll();
            setSocials(response.data || []);
        } catch (error) {
            showToast('error', 'Sosial şəbəkələr yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            showToast('error', 'URL daxil edin');
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
                showToast('success', 'Sosial şəbəkə yeniləndi');
            } else {
                await socialsAPI.create({
                    url: formData.url,
                    type: formData.type,
                });
                showToast('success', 'Sosial şəbəkə əlavə edildi');
            }

            setModalOpen(false);
            fetchData();
        } catch (error) {
            showToast('error', 'Əməliyyat uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        setFormLoading(true);
        try {
            await socialsAPI.delete(selectedItem.id);
            showToast('success', 'Sosial şəbəkə silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch (error) {
            showToast('error', 'Silmə uğursuz oldu');
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
            header: 'Platform',
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
            header: 'URL',
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
                <h1 className="page-title">Sosial Şəbəkələr</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={socials}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Sosial şəbəkə tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Sosial Şəbəkəni Redaktə Et' : 'Yeni Sosial Şəbəkə'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Platform</label>
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
                        label="URL"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://..."
                        type="url"
                        required
                    />

                    <div className="button-group right">
                        <CustomButton variant="secondary" onClick={() => setModalOpen(false)}>
                            Ləğv et
                        </CustomButton>
                        <CustomButton type="submit" loading={formLoading}>
                            {selectedItem ? 'Yenilə' : 'Əlavə et'}
                        </CustomButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={`"${getSocialTypeInfo(selectedItem?.type || '').label}" sosial şəbəkəsini silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Socials;
