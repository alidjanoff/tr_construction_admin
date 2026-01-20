import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { contactInfoAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import { useDisplayText } from '../../hooks/useDisplayText';
import type { ContactInfo as ContactInfoType, TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus, FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import './CrudPage.scss';

interface ContactInfoFormData {
    title: TranslatedString;
    detail: TranslatedString;
    url: string;
    contact_type: string;
}

const ContactInfo: React.FC = () => {
    const { t } = useTranslation();
    const [contactInfos, setContactInfos] = useState<ContactInfoType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContactInfoType | null>(null);
    const [formData, setFormData] = useState<ContactInfoFormData>({
        title: {},
        detail: {},
        url: '',
        contact_type: 'address',
    });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();
    const { languages } = useLanguages();
    const { getDisplayText } = useDisplayText();

    const contactTypes = React.useMemo(() => [
        { value: 'address', label: t('pages.contact.types.address'), icon: <FiMapPin /> },
        { value: 'phone', label: t('pages.contact.types.phone'), icon: <FiPhone /> },
        { value: 'email', label: t('pages.contact.types.email'), icon: <FiMail /> },
        { value: 'working_hours', label: t('pages.contact.types.workingHours'), icon: <FiClock /> },
    ], [t]);

    const fetchData = React.useCallback(async () => {
        try {
            const response = await contactInfoAPI.getAll();
            setContactInfos(response.data || []);
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
        setFormData({
            title: createEmptyTranslation(languages),
            detail: createEmptyTranslation(languages),
            url: '',
            contact_type: 'address',
        });
        setModalOpen(true);
    };

    const handleEdit = (item: ContactInfoType) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || {},
            detail: item.detail || {},
            url: item.url || '',
            contact_type: item.contact_type || 'address',
        });
        setModalOpen(true);
    };

    const handleDelete = (item: ContactInfoType) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasTitle = Object.values(formData.title).some(v => v && v.trim());
        const hasDetail = Object.values(formData.detail).some(v => v && v.trim());

        if (!hasTitle || !hasDetail) {
            showToast('error', t('validation.atLeastOneLanguage'));
            return;
        }

        setFormLoading(true);
        try {
            const payload = {
                title: formData.title,
                detail: formData.detail,
                contact_type: formData.contact_type,
                ...(formData.url && { url: formData.url }),
            };

            if (selectedItem) {
                await contactInfoAPI.update({ id: selectedItem.id, ...payload });
                showToast('success', t('messages.saveSuccess'));
            } else {
                await contactInfoAPI.create(payload);
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
            await contactInfoAPI.delete(selectedItem.id);
            showToast('success', t('messages.deleteSuccess'));
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setFormLoading(false);
        }
    };

    const getContactTypeInfo = (type: string) => {
        return contactTypes.find(t => t.value === type) || contactTypes[0];
    };

    const columns = [
        {
            key: 'contact_type' as const,
            header: t('pages.contact.type'),
            render: (item: ContactInfoType) => {
                const typeInfo = getContactTypeInfo(item.contact_type);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {typeInfo.icon}
                        <span>{typeInfo.label}</span>
                    </div>
                );
            }
        },
        {
            key: 'title' as const,
            header: t('pages.contact.contactTitle'),
            render: (item: ContactInfoType) => getDisplayText(item.title, '-')
        },
        {
            key: 'detail' as const,
            header: t('pages.contact.detail'),
            render: (item: ContactInfoType) => getDisplayText(item.detail, '-')
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('pages.contact.title')}</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    {t('common.add')}
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={contactInfos}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage={t('common.noData')}
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? t('pages.contact.editContact') : t('pages.contact.newContact')}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('pages.contact.type')}</label>
                        <select
                            value={formData.contact_type}
                            onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
                            className="custom-select"
                        >
                            {contactTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <TranslatableInput
                        name="title"
                        label={t('pages.contact.contactTitle')}
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                        placeholder={t('pages.contact.contactTitle')}
                        required
                    />

                    <TranslatableInput
                        name="detail"
                        label={t('pages.contact.detail')}
                        value={formData.detail}
                        onChange={(value) => setFormData({ ...formData, detail: value })}
                        placeholder={t('pages.contact.detail')}
                        required
                    />

                    {formData.contact_type === 'address' && (
                        <CustomInput
                            name="url"
                            label={t('pages.contact.url')}
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://maps.google.com/..."
                            type="url"
                        />
                    )}

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
                message={t('pages.contact.deleteConfirm')}
                loading={formLoading}
            />
        </div>
    );
};

export default ContactInfo;
