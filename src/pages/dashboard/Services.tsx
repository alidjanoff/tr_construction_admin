import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { servicesAPI } from '../../services/api';
import type { Service } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', icon: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [iconFile, setIconFile] = useState<File | null>(null);

    const { showToast } = useToast();

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
        setFormData({ title: '', description: '', icon: '' });
        setIconFile(null);
        setModalOpen(true);
    };

    const handleEdit = (item: Service) => {
        setSelectedItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            icon: item.icon,
        });
        setIconFile(null);
        setModalOpen(true);
    };

    const handleDelete = (item: Service) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            showToast('error', 'Bütün sahələri doldurun');
            return;
        }

        setFormLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);

            if (selectedItem) {
                data.append('id', selectedItem.id);
            }

            if (iconFile) {
                data.append('icon', iconFile);
            }

            if (selectedItem) {
                await servicesAPI.update(data);
                showToast('success', 'Xidmət yeniləndi');
            } else {
                await servicesAPI.create(data);
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
        { key: 'title' as const, header: 'Başlıq' },
        {
            key: 'description' as const, header: 'Təsvir', render: (item: Service) =>
                <span className="truncate">{item.description.slice(0, 60)}...</span>
        },
        {
            key: 'icon' as const, header: 'İkon', render: (item: Service) =>
                item.icon ? <img src={item.icon} alt="" className="table-icon" /> : '-'
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
                    <CustomInput
                        name="title"
                        label="Başlıq"
                        placeholder="Xidmət başlığı"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div className="form-group">
                        <label>Təsvir</label>
                        <textarea
                            name="description"
                            placeholder="Xidmət təsviri"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="custom-textarea"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>İkon (şəkil)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        {formData.icon && !iconFile && (
                            <img src={formData.icon} alt="" className="preview-image" />
                        )}
                    </div>

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
                message={`"${selectedItem?.title}" xidmətini silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Services;
