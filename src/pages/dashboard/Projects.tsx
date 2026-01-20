import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { projectsAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { Project, TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import { useDisplayText } from '../../hooks/useDisplayText';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus, FiImage, FiTrash2, FiX } from 'react-icons/fi';
import './CrudPage.scss';

interface ProjectFormData {
    title: TranslatedString;
    details: TranslatedString;
    badge: TranslatedString;
    address: TranslatedString;
    map_url: string;
}

interface GalleryImage {
    id: string;
    image_url: string;
}

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Project | null>(null);
    const [galleryProject, setGalleryProject] = useState<Project | null>(null);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [formData, setFormData] = useState<ProjectFormData>({
        title: {},
        details: {},
        badge: {},
        address: {},
        map_url: '',
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [formLoading, setFormLoading] = useState(false);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

    const { showToast } = useToast();
    const { languages } = useLanguages();
    const { getDisplayText } = useDisplayText();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await projectsAPI.getAll();
            setProjects(response.data.data || []);
        } catch {
            showToast('error', 'Layihələr yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fetch project detail with gallery
    const fetchProjectDetail = async (projectId: string) => {
        try {
            const response = await projectsAPI.getOne(projectId);
            if (response.data) {
                setGalleryImages(response.data.image_gallery || []);
            }
        } catch {
            showToast('error', 'Layihə detalları yüklənə bilmədi');
        }
    };

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

    const handleEdit = async (item: Project) => {
        setSelectedItem(item);
        // Start with list data as initial values
        setFormData({
            title: item.title || createEmptyTranslation(languages),
            details: item.details || createEmptyTranslation(languages),
            badge: item.badge || createEmptyTranslation(languages),
            address: item.address || createEmptyTranslation(languages),
            map_url: item.map_url || '',
        });
        setCoverFile(null);
        setModalOpen(true);

        // Fetch full project details
        try {
            const response = await projectsAPI.getOne(item.id);
            if (response.data) {
                const projectDetail = response.data;
                setFormData({
                    title: projectDetail.title || createEmptyTranslation(languages),
                    details: projectDetail.details || createEmptyTranslation(languages),
                    badge: projectDetail.badge || createEmptyTranslation(languages),
                    address: projectDetail.address || createEmptyTranslation(languages),
                    map_url: projectDetail.map_url || '',
                });
                // Update selectedItem with full data including cover_image
                setSelectedItem(prev => prev ? { ...prev, ...projectDetail } : null);
            }
        } catch {
            showToast('error', 'Layihə detalları yüklənə bilmədi');
        }
    };

    const handleDelete = (item: Project) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleOpenGallery = async (item: Project) => {
        setGalleryProject(item);
        setGalleryImages([]);
        setGalleryFiles([]);
        setGalleryModalOpen(true);
        await fetchProjectDetail(item.id);
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
            await projectsAPI.delete(selectedItem.id);
            showToast('success', 'Layihə silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    // Gallery handlers
    const handleAddGalleryImages = async () => {
        if (!galleryProject || galleryFiles.length === 0) return;

        setGalleryLoading(true);
        try {
            const data = new FormData();
            galleryFiles.forEach(file => {
                data.append('image', file);
            });

            await projectsAPI.addImages(galleryProject.id, data);
            showToast('success', `${galleryFiles.length} şəkil əlavə edildi`);
            setGalleryFiles([]);
            await fetchProjectDetail(galleryProject.id);
        } catch {
            showToast('error', 'Şəkillər əlavə edilə bilmədi');
        } finally {
            setGalleryLoading(false);
        }
    };

    const handleDeleteGalleryImage = async (imageId: string) => {
        if (!galleryProject) return;

        setDeletingImageId(imageId);
        try {
            await projectsAPI.deleteImage(galleryProject.id, imageId);
            showToast('success', 'Şəkil silindi');
            setGalleryImages(prev => prev.filter(img => img.id !== imageId));
        } catch {
            showToast('error', 'Şəkil silinə bilmədi');
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        console.log('Files selected:', files);
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            console.log('File array:', fileArray);
            setGalleryFiles(prevFiles => {
                const newFiles = [...prevFiles, ...fileArray];
                console.log('New galleryFiles state:', newFiles);
                return newFiles;
            });
        }
        e.target.value = ''; // Reset input
    };

    const removeNewGalleryFile = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
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
            render: (item: Project) => getDisplayText(item.title, '-')
        },
        {
            key: 'badge' as const,
            header: 'Nişan',
            render: (item: Project) => (
                <span className="badge">{getDisplayText(item.badge, '-')}</span>
            )
        },
        {
            key: 'gallery' as const,
            header: 'Qalereya',
            render: (item: Project) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <CustomButton
                        size="sm"
                        variant="secondary"
                        icon={<FiImage />}
                        onClick={() => handleOpenGallery(item)}
                    >
                        Şəkillər
                    </CustomButton>
                </div>
            )
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

            {/* Project Form Modal */}
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

            {/* Gallery Modal */}
            <Modal
                isOpen={galleryModalOpen}
                onClose={() => setGalleryModalOpen(false)}
                title={`Qalereya - ${getDisplayText(galleryProject?.title, 'Layihə')}`}
                size="lg"
            >
                <div className="gallery-modal-content">
                    {/* Existing Images */}
                    <div className="gallery-section">
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            Mövcud şəkillər ({galleryImages.length})
                        </h4>

                        {galleryImages.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                color: 'var(--text-muted)'
                            }}>
                                <FiImage size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>Bu layihəyə hələ şəkil əlavə edilməyib</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '1rem'
                            }}>
                                {galleryImages.map((img) => (
                                    <div
                                        key={img.id}
                                        style={{
                                            position: 'relative',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            aspectRatio: '4/3',
                                            background: 'var(--bg-tertiary)'
                                        }}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt=""
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteGalleryImage(img.id)}
                                            disabled={deletingImageId === img.id}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(239, 68, 68, 0.9)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                padding: '6px',
                                                cursor: 'pointer',
                                                color: 'white',
                                                opacity: deletingImageId === img.id ? 0.5 : 1
                                            }}
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Images */}
                    <div className="gallery-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--medium-gray)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Yeni şəkillər əlavə et
                        </h4>

                        <div style={{ marginBottom: '1rem' }}>
                            <label
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: '#1B5E3A',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2E7D4E'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#1B5E3A'}
                            >
                                <FiPlus size={18} />
                                Şəkil seç
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {/* Debug info */}
                        <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>
                            Seçilmiş fayl sayı: {galleryFiles.length}
                        </p>

                        {galleryFiles.length > 0 && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'var(--light-gray)',
                                borderRadius: '8px'
                            }}>
                                <p style={{ marginBottom: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    Seçilmiş şəkillər ({galleryFiles.length}):
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    {galleryFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                position: 'relative',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                aspectRatio: '4/3',
                                                border: '2px solid #1B5E3A',
                                                background: '#fff'
                                            }}
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewGalleryFile(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: '#EF4444',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'white'
                                                }}
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <CustomButton
                                    icon={<FiPlus />}
                                    onClick={handleAddGalleryImages}
                                    loading={galleryLoading}
                                >
                                    {galleryFiles.length} şəkil yüklə
                                </CustomButton>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={`"${getDisplayText(selectedItem?.title, '')}" layihəsini silmək istədiyinizə əminsiniz? Bu əməliyyat layihəyə aid bütün şəkilləri də siləcək.`}
                loading={formLoading}
            />
        </div>
    );
};

export default Projects;
