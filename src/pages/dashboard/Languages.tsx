import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { languagesAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { Language } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus, FiGlobe } from 'react-icons/fi';
import './CrudPage.scss';

// Helper to convert ObjectId buffer to string
const getIdString = (id: unknown): string => {
    if (typeof id === 'string') return id;
    if (id && typeof id === 'object' && 'buffer' in id) {
        const buffer = id.buffer as Record<string, number>;
        const bytes = Object.values(buffer) as number[];
        return bytes.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    }
    return String(id);
};

const Languages: React.FC = () => {
    const { t } = useTranslation();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Language | null>(null);
    const [formData, setFormData] = useState({ lang: '' });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();
    const { refreshLanguages } = useLanguages();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await languagesAPI.getAll();
            setLanguages(response.data || []);
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
        setFormData({ lang: '' });
        setModalOpen(true);
    };

    const handleEdit = (item: Language) => {
        setSelectedItem(item);
        setFormData({ lang: item.lang });
        setModalOpen(true);
    };

    const handleDelete = (item: Language) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const langCode = formData.lang.trim().toLowerCase();

        if (!langCode || langCode.length < 2 || langCode.length > 3) {
            showToast('error', t('validation.required'));
            return;
        }

        if (!/^[a-z]{2,3}$/.test(langCode)) {
            showToast('error', t('validation.required'));
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await languagesAPI.update({
                    id: selectedItem.id,
                    lang: langCode,
                });
                showToast('success', t('messages.saveSuccess'));
            } else {
                await languagesAPI.create({ lang: langCode });
                showToast('success', t('messages.saveSuccess'));
            }

            setModalOpen(false);
            fetchData();
            refreshLanguages();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || t('messages.saveError');
            showToast('error', message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        setFormLoading(true);
        try {
            await languagesAPI.delete(selectedItem.id);
            showToast('success', t('messages.deleteSuccess'));
            setDeleteDialogOpen(false);
            fetchData();
            refreshLanguages();
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'lang' as const,
            header: t('pages.languages.langCode'),
            render: (item: Language) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiGlobe />
                    <strong>{item.lang.toUpperCase()}</strong>
                </div>
            )
        },
        {
            key: 'id' as const,
            header: 'ID',
            render: (item: Language) => (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {getIdString(item.id).slice(-8)}
                </span>
            )
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('sidebar.languages')}</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    {t('pages.languages.newLanguage')}
                </CustomButton>
            </div>

            <div className="info-banner">
                <FiGlobe />
                <p>{t('pages.languages.info')}</p>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={languages}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage={t('common.noData')}
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? t('pages.languages.editLanguage') : t('pages.languages.newLanguage')}
                size="sm"
            >
                <form onSubmit={handleSubmit}>
                    <CustomInput
                        name="lang"
                        label={t('pages.languages.langCode')}
                        placeholder="məs: az, en, tr, ru"
                        value={formData.lang}
                        onChange={(e) => setFormData({ lang: e.target.value.toLowerCase() })}
                        required
                    />

                    <div className="form-hint">
                        <p>{t('pages.languages.hint')}</p>
                        <p>{t('pages.languages.examples')}</p>
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
                message={t('pages.languages.deleteConfirm')}
                loading={formLoading}
            />
        </div>
    );
};

export default Languages;
