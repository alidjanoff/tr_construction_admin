import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { languagesAPI } from '../../services/api';
import type { Language } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus, FiGlobe } from 'react-icons/fi';
import './CrudPage.scss';

const COMMON_LANGUAGES = [
    { code: 'az', name: 'Azərbaycan' },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
];

const Languages: React.FC = () => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Language | null>(null);
    const [formData, setFormData] = useState({
        lang: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();

    const fetchData = async () => {
        try {
            const response = await languagesAPI.getAll();
            setLanguages(response.data || []);
        } catch {
            showToast('error', 'Dillər yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

        if (!formData.lang.trim()) {
            showToast('error', 'Dil kodu daxil edin');
            return;
        }

        // Check if already exists
        const exists = languages.some(l =>
            l.lang.toLowerCase() === formData.lang.toLowerCase() &&
            l.id !== selectedItem?.id
        );

        if (exists) {
            showToast('error', 'Bu dil artıq mövcuddur');
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await languagesAPI.update({
                    id: selectedItem.id,
                    lang: formData.lang.toLowerCase(),
                });
                showToast('success', 'Dil yeniləndi');
            } else {
                await languagesAPI.create({
                    lang: formData.lang.toLowerCase(),
                });
                showToast('success', 'Dil əlavə edildi');
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

        // Prevent deleting 'az' or 'en'
        if (selectedItem.lang === 'az' || selectedItem.lang === 'en') {
            showToast('error', 'Əsas dilləri (AZ, EN) silmək olmaz');
            setDeleteDialogOpen(false);
            return;
        }

        setFormLoading(true);
        try {
            await languagesAPI.delete(selectedItem.id);
            showToast('success', 'Dil silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const getLangName = (code: string) => {
        return COMMON_LANGUAGES.find(l => l.code === code)?.name || code.toUpperCase();
    };

    const columns = [
        {
            key: 'lang' as const,
            header: 'Dil Kodu',
            render: (item: Language) => (
                <span className="lang-code">
                    <FiGlobe /> {item.lang.toUpperCase()}
                </span>
            )
        },
        {
            key: 'name' as const,
            header: 'Dil Adı',
            render: (item: Language) => getLangName(item.lang)
        },
    ];

    // Filter available languages for quick add
    const availableLangs = COMMON_LANGUAGES.filter(
        cl => !languages.some(l => l.lang === cl.code)
    );

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Dillər</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={languages}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Dil tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Dil Redaktə Et' : 'Yeni Dil'}
                size="sm"
            >
                <form onSubmit={handleSubmit}>
                    {!selectedItem && availableLangs.length > 0 && (
                        <div className="quick-add">
                            <label>Sürətli Əlavə:</label>
                            <div className="quick-add-buttons">
                                {availableLangs.map(lang => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        className="quick-add-btn"
                                        onClick={() => setFormData({ lang: lang.code })}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <CustomInput
                        name="lang"
                        label="Dil Kodu"
                        placeholder="Məsələn: ru"
                        value={formData.lang}
                        onChange={(e) => setFormData({ lang: e.target.value })}
                        required
                        maxLength={5}
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
                message={`"${selectedItem?.lang.toUpperCase()}" dilini silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Languages;
