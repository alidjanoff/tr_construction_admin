import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { testimonialsAPI, languagesAPI } from '../../services/api';
import type { Testimonial, Language, MultiLang } from '../../types';
import { createEmptyMultiLang, ensureMultiLang } from '../../utils/lang';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

const Testimonials: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState({
        customer_full_name: '',
        customer_type: {} as MultiLang,
        customer_review: {} as MultiLang,
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
            const response = await testimonialsAPI.getAll();
            setTestimonials(response.data || []);
        } catch (error) {
            showToast('error', 'Rəylər yüklənə bilmədi');
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
            customer_full_name: '',
            customer_type: createEmptyMultiLang(languages),
            customer_review: createEmptyMultiLang(languages),
        });
        setModalOpen(true);
    };

    const handleEdit = (item: Testimonial) => {
        setSelectedItem(item);
        setFormData({
            customer_full_name: item.customer_full_name,
            customer_type: ensureMultiLang(item.customer_type, languages),
            customer_review: ensureMultiLang(item.customer_review, languages),
        });
        setModalOpen(true);
    };

    const handleDelete = (item: Testimonial) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customer_full_name.trim()) {
            showToast('error', 'Müştəri adını daxil edin');
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await testimonialsAPI.update({ id: selectedItem.id, ...formData });
                showToast('success', 'Rəy yeniləndi');
            } else {
                await testimonialsAPI.create(formData);
                showToast('success', 'Rəy əlavə edildi');
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
            await testimonialsAPI.delete(selectedItem.id);
            showToast('success', 'Rəy silindi');
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
        { key: 'customer_full_name' as const, header: 'Müştəri' },
        {
            key: 'customer_type' as const,
            header: 'Vəzifə/Tip',
            render: (item: Testimonial) => getDisplayValue(item.customer_type)
        },
        {
            key: 'customer_review' as const,
            header: 'Rəy',
            render: (item: Testimonial) => (
                <span className="truncate">{getDisplayValue(item.customer_review).slice(0, 50)}...</span>
            )
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Müştəri Rəyləri</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd} disabled={languages.length === 0}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={testimonials}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Rəy tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Rəyi Redaktə Et' : 'Yeni Rəy'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <CustomInput
                        name="customer_full_name"
                        label="Müştəri Adı"
                        placeholder="Məs: Əli Əliyev"
                        value={formData.customer_full_name}
                        onChange={(e) => setFormData({ ...formData, customer_full_name: e.target.value })}
                        required
                    />

                    <MultiLangInput
                        label="Müştəri Vəzifəsi / Tipi"
                        name="customer_type"
                        value={formData.customer_type}
                        onChange={(val) => setFormData({ ...formData, customer_type: val })}
                        placeholder="Məs: CEO, Müştəri"
                        languages={languages}
                    />

                    <MultiLangInput
                        label="Rəy"
                        name="customer_review"
                        value={formData.customer_review}
                        onChange={(val) => setFormData({ ...formData, customer_review: val })}
                        placeholder="Müştəri rəyi..."
                        type="textarea"
                        rows={4}
                        languages={languages}
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
                message={`"${selectedItem?.customer_full_name}" tərəfindən yazılan rəyi silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Testimonials;
