import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { servicesAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { Service, TranslatedString } from '../../types';
import { createEmptyTranslation, getTranslationValue } from '../../types';
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

    const { showToast } = useToast();
    const { languages } = useLanguages();

    const fetchData = async () => {
        try {
            const response = await servicesAPI.getAll();
            setServices(response.data || []);
        } catch (error) {
            showToast('error', 'Xidmətlər yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            await servicesAPI.delete(selectedItem.id);
            showToast('success', 'Xidmət silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch (error) {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'title' as const,
            header: 'Başlıq',
            render: (item: Service) => getTranslationValue(item.title, 'az')
        },
        {
            key: 'info' as const,
            header: 'Məlumat',
            render: (item: Service) => {
                const text = getTranslationValue(item.info, 'az');
                return <span className="truncate">{text.slice(0, 60)}{text.length > 60 ? '...' : ''}</span>;
            }
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Xidmətlər</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={services}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Xidmət tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Xidməti Redaktə Et' : 'Yeni Xidmət'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <TranslatableInput
                        name="title"
                        label="Başlıq"
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                        placeholder="Xidmət başlığı"
                        required
                    />

                    <TranslatableInput
                        name="info"
                        label="Məlumat"
                        value={formData.info}
                        onChange={(value) => setFormData({ ...formData, info: value })}
                        type="textarea"
                        placeholder="Xidmət haqqında məlumat"
                        rows={4}
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
                message={`"${getTranslationValue(selectedItem?.title, 'az')}" xidmətini silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Services;
