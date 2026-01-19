import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { contactInfoAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { ContactInfo as ContactInfoType, TranslatedString } from '../../types';
import { createEmptyTranslation, getTranslationValue } from '../../types';
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

const contactTypes = [
    { value: 'address', label: 'Ünvan', icon: <FiMapPin /> },
    { value: 'phone', label: 'Telefon', icon: <FiPhone /> },
    { value: 'email', label: 'E-poçt', icon: <FiMail /> },
    { value: 'working_hours', label: 'İş Saatları', icon: <FiClock /> },
];

const ContactInfo: React.FC = () => {
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

    const fetchData = React.useCallback(async () => {
        try {
            const response = await contactInfoAPI.getAll();
            setContactInfos(response.data || []);
        } catch {
            showToast('error', 'Əlaqə məlumatları yüklənə bilmədi');
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
            showToast('error', 'Ən azı bir dildə başlıq və detal daxil edin');
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
                showToast('success', 'Əlaqə məlumatı yeniləndi');
            } else {
                await contactInfoAPI.create(payload);
                showToast('success', 'Əlaqə məlumatı əlavə edildi');
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
            await contactInfoAPI.delete(selectedItem.id);
            showToast('success', 'Əlaqə məlumatı silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', 'Silmə uğursuz oldu');
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
            header: 'Tip',
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
            header: 'Başlıq',
            render: (item: ContactInfoType) => getTranslationValue(item.title, 'az')
        },
        {
            key: 'detail' as const,
            header: 'Detal',
            render: (item: ContactInfoType) => getTranslationValue(item.detail, 'az')
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Əlaqə Məlumatları</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={contactInfos}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Əlaqə məlumatı tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Əlaqə Məlumatını Redaktə Et' : 'Yeni Əlaqə Məlumatı'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tip</label>
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
                        label="Başlıq"
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                        placeholder="məs: Ünvan, Telefon, E-poçt"
                        required
                    />

                    <TranslatableInput
                        name="detail"
                        label="Detal"
                        value={formData.detail}
                        onChange={(value) => setFormData({ ...formData, detail: value })}
                        placeholder="Əlaqə məlumatı"
                        required
                    />

                    <CustomInput
                        name="url"
                        label="URL (İstəyə bağlı)"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://..."
                        type="url"
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
                message={`"${getTranslationValue(selectedItem?.title, 'az')}" əlaqə məlumatını silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default ContactInfo;
