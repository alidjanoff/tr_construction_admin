import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { projectsAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { Project, TranslatedString } from '../../types';
import { createEmptyTranslation, getTranslationValue } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus, FiImage } from 'react-icons/fi';
import './CrudPage.scss';

interface ProjectFormData {
    title: TranslatedString;
    details: TranslatedString;
    badge: TranslatedString;
    address: TranslatedString;
    map_url: string;
}

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Project | null>(null);
    const [formData, setFormData] = useState<ProjectFormData>({
        title: {},
        details: {},
        badge: {},
        address: {},
        map_url: '',
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();
    const { languages } = useLanguages();

    const fetchData = async () => {
        try {
            const response = await projectsAPI.getAll();
            setProjects(response.data.data || []);
        } catch (error) {
            showToast('error', 'Layihələr yüklənə bilmədi');
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
            details: createEmptyTranslation(languages),
            badge: createEmptyTranslation(languages),
            address: createEmptyTranslation(languages),
            map_url: '',
        });
        setCoverFile(null);
        setModalOpen(true);
    };

    const handleEdit = (item: Project) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || {},
            details: item.details || {},
            badge: item.badge || {},
            address: item.address || {},
            map_url: item.map_url || '',
        });
        setCoverFile(null);
        setModalOpen(true);
    };

    const handleDelete = (item: Project) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasTitle = Object.values(formData.title).some(v => v && v.trim());
        const hasDetails = Object.values(formData.details).some(v => v && v.trim());

        if (!hasTitle || !hasDetails) {
            showToast('error', 'Ən azı bir dildə başlıq və detalları daxil edin');
            return;
        }

        if (!selectedItem && !coverFile) {
            showToast('error', 'Örtük şəkli yükləyin');
            return;
        }

        setFormLoading(true);
        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));
            data.append('details', JSON.stringify(formData.details));
            data.append('badge', JSON.stringify(formData.badge));
            data.append('address', JSON.stringify(formData.address));
            data.append('map_url', formData.map_url);

            if (selectedItem) {
                data.append('id', selectedItem.id);
            }

            if (coverFile) {
                data.append('cover_image', coverFile);
            }

            if (selectedItem) {
                await projectsAPI.update(data);
                showToast('success', 'Layihə yeniləndi');
            } else {
                await projectsAPI.create(data);
                showToast('success', 'Layihə əlavə edildi');
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
            await projectsAPI.delete(selectedItem.id);
            showToast('success', 'Layihə silindi');
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
            key: 'cover_image' as const,
            header: 'Şəkil',
            render: (item: Project) =>
                item.cover_image ? (
                    <img
                        src={item.cover_image}
                        alt=""
                        className="table-icon"
                        style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                    />
                ) : '-'
        },
        {
            key: 'title' as const,
            header: 'Başlıq',
            render: (item: Project) => getTranslationValue(item.title, 'az')
        },
        {
            key: 'badge' as const,
            header: 'Nişan',
            render: (item: Project) => (
                <span className="badge">{getTranslationValue(item.badge, 'az') || '-'}</span>
            )
        },
        {
            key: 'address' as const,
            header: 'Ünvan',
            render: (item: Project) => getTranslationValue(item.address, 'az') || '-'
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Layihələr</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={projects}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Layihə tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Layihəni Redaktə Et' : 'Yeni Layihə'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-col">
                            <TranslatableInput
                                name="title"
                                label="Başlıq"
                                value={formData.title}
                                onChange={(value) => setFormData({ ...formData, title: value })}
                                placeholder="Layihə başlığı"
                                required
                            />
                        </div>
                        <div className="form-col">
                            <TranslatableInput
                                name="badge"
                                label="Nişan (Badge)"
                                value={formData.badge}
                                onChange={(value) => setFormData({ ...formData, badge: value })}
                                placeholder="məs: Yeni, VIP, Tamamlandı"
                            />
                        </div>
                    </div>

                    <TranslatableInput
                        name="details"
                        label="Detallar"
                        value={formData.details}
                        onChange={(value) => setFormData({ ...formData, details: value })}
                        type="textarea"
                        placeholder="Layihə haqqında ətraflı məlumat"
                        rows={4}
                        required
                    />

                    <div className="form-row">
                        <div className="form-col">
                            <TranslatableInput
                                name="address"
                                label="Ünvan"
                                value={formData.address}
                                onChange={(value) => setFormData({ ...formData, address: value })}
                                placeholder="Layihə ünvanı"
                            />
                        </div>
                        <div className="form-col">
                            <CustomInput
                                name="map_url"
                                label="Xəritə URL"
                                value={formData.map_url}
                                onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                                placeholder="Google Maps URL"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FiImage style={{ marginRight: '8px' }} />
                            Örtük Şəkli
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        {(selectedItem?.cover_image || coverFile) && (
                            <div className="preview-image-container" style={{ marginTop: '1rem' }}>
                                <img
                                    src={coverFile ? URL.createObjectURL(coverFile) : selectedItem?.cover_image}
                                    alt="Preview"
                                    className="preview-image"
                                    style={{ maxHeight: '150px' }}
                                />
                            </div>
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
                message={`"${getTranslationValue(selectedItem?.title, 'az')}" layihəsini silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Projects;
