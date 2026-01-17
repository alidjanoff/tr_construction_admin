import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { contactInfoAPI, languagesAPI } from '../../services/api';
import type { ContactInfo, Language, MultiLang } from '../../types';
import { createEmptyMultiLang, ensureMultiLang } from '../../utils/lang';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

const contactTypes = [
    { value: 'address', label: 'Ünvan' },
    { value: 'phone', label: 'Telefon' },
    { value: 'email', label: 'E-poçt' },
    { value: 'hours', label: 'İş saatları' },
    { value: 'other', label: 'Digər' },
];

const ContactInfoPage: React.FC = () => {
    const [contacts, setContacts] = useState<ContactInfo[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContactInfo | null>(null);
    const [formData, setFormData] = useState({
        title: {} as MultiLang,
        detail: {} as MultiLang,
        url: '',
        contact_type: 'address',
    });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();

    const fetchLanguages = async () => {
        try {
            const response = await languagesAPI.getAll();
            const langs = response.data?.map((l: Language) => l.lang) || ['az', 'en'];
            setLanguages(langs);
            return langs;
        } catch {
            const fallback = ['az', 'en'];
            setLanguages(fallback);
            return fallback;
        }
    };

    const fetchData = async () => {
        try {
            const response = await contactInfoAPI.getAll();
            setContacts(response.data || []);
        } catch (error) {
            showToast('error', 'Məlumatlar yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchLanguages();
            await fetchData();
        };
        init();
    }, []);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({
            title: createEmptyMultiLang(languages),
            detail: createEmptyMultiLang(languages),
            url: '',
            contact_type: 'address',
        });
        setModalOpen(true);
    };

    const handleEdit = (item: ContactInfo) => {
        setSelectedItem(item);
        setFormData({
            title: ensureMultiLang(item.title, languages),
            detail: ensureMultiLang(item.detail, languages),
            url: item.url || '',
            contact_type: item.contact_type,
        });
        setModalOpen(true);
    };

    const handleDelete = (item: ContactInfo) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (selectedItem) {
                await contactInfoAPI.update({ id: selectedItem.id, ...formData });
                showToast('success', 'Məlumat yeniləndi');
            } else {
                await contactInfoAPI.create(formData);
                showToast('success', 'Məlumat əlavə edildi');
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
            await contactInfoAPI.delete(selectedItem.id);
            showToast('success', 'Məlumat silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch (error) {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const getDisplayValue = (multiLang: MultiLang) => {
        if (!multiLang) return '-';
        return multiLang.az || multiLang.en || Object.values(multiLang).find(v => v) || '-';
    };

    const columns = [
        {
            key: 'contact_type' as const,
            header: 'Tip',
            render: (item: ContactInfo) => contactTypes.find(t => t.value === item.contact_type)?.label || item.contact_type
        },
        {
            key: 'title' as const,
            header: 'Başlıq',
            render: (item: ContactInfo) => <strong>{getDisplayValue(item.title)}</strong>
        },
        {
            key: 'detail' as const,
            header: 'Məzmun',
            render: (item: ContactInfo) => getDisplayValue(item.detail)
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Əlaqə Məlumatları</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd} disabled={languages.length === 0}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={contacts}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Məlumat tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Məlumatı Redaktə Et' : 'Yeni Məlumat'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label>Tip</label>
                        <select
                            className="custom-select"
                            value={formData.contact_type}
                            onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
                        >
                            {contactTypes.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <MultiLangInput
                        label="Başlıq (Məs: Ünvanımız, Telefon)"
                        name="title"
                        value={formData.title}
                        onChange={(val) => setFormData({ ...formData, title: val })}
                        languages={languages}
                        required
                    />

                    <MultiLangInput
                        label="Məzmun"
                        name="detail"
                        value={formData.detail}
                        onChange={(val) => setFormData({ ...formData, detail: val })}
                        languages={languages}
                        required
                    />

                    <CustomInput
                        label="Keçid URL (Opsional)"
                        name="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="Məs: tel:+994501234567"
                    />

                    <div className="button-group right mt-4">
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
                message="Bu əlaqə məlumatını silmək istədiyinizə əminsiniz?"
                loading={formLoading}
            />
        </div>
    );
};

export default ContactInfoPage;
