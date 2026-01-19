import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { testimonialsAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { Testimonial, TranslatedString } from '../../types';
import { createEmptyTranslation, getTranslationValue } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

interface TestimonialFormData {
    customer_full_name: string;
    customer_type: TranslatedString;
    customer_review: TranslatedString;
}

const Testimonials: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState<TestimonialFormData>({
        customer_full_name: '',
        customer_type: {},
        customer_review: {},
    });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();
    const { languages } = useLanguages();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await testimonialsAPI.getAll();
            setTestimonials(response.data || []);
        } catch {
            showToast('error', 'Müştəri rəyləri yüklənə bilmədi');
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
            customer_full_name: '',
            customer_type: createEmptyTranslation(languages),
            customer_review: createEmptyTranslation(languages),
        });
        setModalOpen(true);
    };

    const handleEdit = (item: Testimonial) => {
        setSelectedItem(item);
        setFormData({
            customer_full_name: item.customer_full_name,
            customer_type: item.customer_type || {},
            customer_review: item.customer_review || {},
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

        const hasType = Object.values(formData.customer_type).some(v => v && v.trim());
        const hasReview = Object.values(formData.customer_review).some(v => v && v.trim());

        if (!hasType || !hasReview) {
            showToast('error', 'Ən azı bir dildə müştəri tipi və rəyi daxil edin');
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await testimonialsAPI.update({
                    id: selectedItem.id,
                    customer_full_name: formData.customer_full_name,
                    customer_type: formData.customer_type,
                    customer_review: formData.customer_review,
                });
                showToast('success', 'Rəy yeniləndi');
            } else {
                await testimonialsAPI.create({
                    customer_full_name: formData.customer_full_name,
                    customer_type: formData.customer_type,
                    customer_review: formData.customer_review,
                });
                showToast('success', 'Rəy əlavə edildi');
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
            await testimonialsAPI.delete(selectedItem.id);
            showToast('success', 'Rəy silindi');
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
            key: 'customer_full_name' as const,
            header: 'Müştəri Adı',
        },
        {
            key: 'customer_type' as const,
            header: 'Müştəri Tipi',
            render: (item: Testimonial) => getTranslationValue(item.customer_type, 'az')
        },
        {
            key: 'customer_review' as const,
            header: 'Rəy',
            render: (item: Testimonial) => {
                const text = getTranslationValue(item.customer_review, 'az');
                return <span className="truncate">{text.slice(0, 50)}{text.length > 50 ? '...' : ''}</span>;
            }
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Müştəri Rəyləri</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
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
                        value={formData.customer_full_name}
                        onChange={(e) => setFormData({ ...formData, customer_full_name: e.target.value })}
                        placeholder="Ad Soyad"
                        required
                    />

                    <TranslatableInput
                        name="customer_type"
                        label="Müştəri Tipi"
                        value={formData.customer_type}
                        onChange={(value) => setFormData({ ...formData, customer_type: value })}
                        placeholder="məs: Ev sahibi, Şirkət, Investor"
                        required
                    />

                    <TranslatableInput
                        name="customer_review"
                        label="Rəy"
                        value={formData.customer_review}
                        onChange={(value) => setFormData({ ...formData, customer_review: value })}
                        type="textarea"
                        placeholder="Müştəri rəyi..."
                        rows={5}
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
                message={`"${selectedItem?.customer_full_name}" müştərisinin rəyini silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Testimonials;
