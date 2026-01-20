import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { servicesAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import { useDisplayText } from '../../hooks/useDisplayText';
import type { Service, TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

interface ServiceFormData {
    title: TranslatedString;
    info: TranslatedString;
}

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Service | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>({ title: {}, info: {} });
    const [formLoading, setFormLoading] = useState(false);

    const { t } = useTranslation();
    const { showToast } = useToast();
    const { languages } = useLanguages();
    const { getDisplayText } = useDisplayText();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await servicesAPI.getAll();
            setServices(response.data || []);
        } catch {
            showToast('error', 'Xidmətlər yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({
            title: createEmptyTranslation(languages),
            info: createEmptyTranslation(languages),
        });
        setModalOpen(true);
    };

    const handleEdit = (item: Service) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || {},
            info: item.info || {},
        });
        setModalOpen(true);
    };

    const handleDelete = (item: Service) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate at least one language has content
        const hasTitle = Object.values(formData.title).some(v => v && v.trim());
        const hasInfo = Object.values(formData.info).some(v => v && v.trim());

        if (!hasTitle || !hasInfo) {
            showToast('error', 'Ən azı bir dildə başlıq və təsvir daxil edin');
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await servicesAPI.update({
                    id: selectedItem.id,
                    title: formData.title,
                    info: formData.info,
                });
                showToast('success', 'Xidmət yeniləndi');
            } else {
                await servicesAPI.create({
                    title: formData.title,
                    info: formData.info,
                });
                showToast('success', 'Xidmət əlavə edildi');
            }

            setModalOpen(false);
            fetchData();
        } catch {
            showToast('error', 'Əməliyyat uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        setFormLoading(true);
        try {
            await servicesAPI.delete(selectedItem.id);
            showToast('success', 'Xidmət silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'title' as const,
            header: t('pages.services.serviceTitle'),
            render: (item: Service) => getDisplayText(item.title, t('common.noData'))
        },
        {
            key: 'info' as const,
            header: t('pages.about.info'),
            render: (item: Service) => {
                const text = getDisplayText(item.info, '');
                return <span className="truncate">{text.slice(0, 60)}{text.length > 60 ? '...' : ''}</span>;
            }
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('pages.services.title')}</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    {t('common.add')}
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={services}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage={t('common.noData')}
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? t('pages.services.editService') : t('pages.services.newService')}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <TranslatableInput
                        name="title"
                        label={t('pages.services.serviceTitle')}
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                        placeholder={t('pages.services.serviceTitle')}
                        required
                    />

                    <TranslatableInput
                        name="info"
                        label={t('pages.about.info')}
                        value={formData.info}
                        onChange={(value) => setFormData({ ...formData, info: value })}
                        type="textarea"
                        placeholder={t('pages.about.info')}
                        rows={4}
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
                message={t('pages.services.deleteConfirm')}
                loading={formLoading}
            />
        </div>
    );
};

export default Services;
