import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { partnersAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import { useDisplayText } from '../../hooks/useDisplayText';
import type { Partner, TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

interface PartnerFormData {
    title: TranslatedString;
}

const Partners: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Partner | null>(null);
    const [formData, setFormData] = useState<PartnerFormData>({ title: {} });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const { t } = useTranslation();
    const { showToast } = useToast();
    const { languages } = useLanguages();
    const { getDisplayText } = useDisplayText();

    const fetchData = async () => {
        try {
            const response = await partnersAPI.getAll();
            setPartners(response.data || []);
        } catch {
            showToast('error', t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchDataCallback = React.useCallback(fetchData, [showToast, t]);

    useEffect(() => {
        fetchDataCallback();
    }, [fetchDataCallback]);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({
            title: createEmptyTranslation(languages),
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleEdit = (item: Partner) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || {},
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleDelete = (item: Partner) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasTitle = Object.values(formData.title).some(v => v && v.trim());

        if (!hasTitle) {
            showToast('error', t('validation.atLeastOneLanguage'));
            return;
        }

        if (!selectedItem && !imageFile) {
            showToast('error', t('pages.partners.logo') + ' ' + t('validation.required').toLowerCase());
            return;
        }

        setFormLoading(true);
        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));

            if (selectedItem) {
                data.append('id', selectedItem.id);
            }

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (selectedItem) {
                await partnersAPI.update(data);
                showToast('success', t('messages.saveSuccess'));
            } else {
                await partnersAPI.create(data);
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
            await partnersAPI.delete(selectedItem.id);
            showToast('success', t('messages.deleteSuccess'));
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'image' as const,
            header: t('pages.partners.logo'),
            render: (item: Partner) =>
                item.image ? <img src={item.image} alt="" className="table-icon" style={{ width: 60, height: 40, objectFit: 'contain' }} /> : '-'
        },
        {
            key: 'title' as const,
            header: t('pages.partners.partnerName'),
            render: (item: Partner) => getDisplayText(item.title, '-')
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('sidebar.partners')}</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    {t('common.add')}
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={partners}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage={t('common.noData')}
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? t('pages.partners.editPartner') : t('pages.partners.newPartner')}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <TranslatableInput
                        name="title"
                        label={t('pages.partners.partnerName')}
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                        placeholder={t('pages.partners.partnerName')}
                        required
                    />

                    <div className="form-group">
                        <label>{t('pages.partners.logo')}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        {selectedItem?.image && !imageFile && (
                            <img src={selectedItem.image} alt="" className="preview-image" style={{ maxHeight: 80 }} />
                        )}
                    </div>

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
                message={t('pages.partners.deleteConfirm')}
                loading={formLoading}
            />
        </div>
    );
};

export default Partners;
