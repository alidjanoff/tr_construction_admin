import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            showToast('error', t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    }, [showToast, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchProjectDetail = async (projectId: string) => {
        try {
            const response = await projectsAPI.getOne(projectId);
            if (response.data) {
                setGalleryImages(response.data.image_gallery || []);
            }
        } catch {
            showToast('error', t('messages.loadError'));
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
        setFormData({
            title: item.title || createEmptyTranslation(languages),
            details: item.details || createEmptyTranslation(languages),
            badge: item.badge || createEmptyTranslation(languages),
            address: item.address || createEmptyTranslation(languages),
            map_url: item.map_url || '',
        });
        setCoverFile(null);
        setModalOpen(true);

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
                setSelectedItem(prev => prev ? { ...prev, ...projectDetail } : null);
            }
        } catch {
            showToast('error', t('messages.loadError'));
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
            showToast('error', t('validation.atLeastOneLanguage'));
            return;
        }

        if (!selectedItem && !coverFile) {
            showToast('error', t('pages.projects.coverImage') + ' ' + t('validation.required').toLowerCase());
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
                showToast('success', t('messages.saveSuccess'));
            } else {
                await projectsAPI.create(data);
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
            await projectsAPI.delete(selectedItem.id);
            showToast('success', t('messages.deleteSuccess'));
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleAddGalleryImages = async () => {
        if (!galleryProject || galleryFiles.length === 0) return;

        setGalleryLoading(true);
        try {
            const data = new FormData();
            galleryFiles.forEach(file => {
                data.append('image', file);
            });

            await projectsAPI.addImages(galleryProject.id, data);
            showToast('success', t('messages.uploadSuccess'));
            setGalleryFiles([]);
            await fetchProjectDetail(galleryProject.id);
        } catch {
            showToast('error', t('messages.uploadError'));
        } finally {
            setGalleryLoading(false);
        }
    };

    const handleDeleteGalleryImage = async (imageId: string) => {
        if (!galleryProject) return;

        setDeletingImageId(imageId);
        try {
            await projectsAPI.deleteImage(galleryProject.id, imageId);
            showToast('success', t('messages.deleteSuccess'));
            setGalleryImages(prev => prev.filter(img => img.id !== imageId));
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setGalleryFiles(prevFiles => [...prevFiles, ...fileArray]);
        }
        e.target.value = '';
    };

    const removeNewGalleryFile = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Format file size to human readable format
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Check if file is oversized (> 1MB)
    const isOversized = (file: File): boolean => {
        const maxSize = 1 * 1024 * 1024; // 1MB
        return file.size > maxSize;
    };

    // Check if any file is oversized
    const hasOversizedFiles = galleryFiles.some(file => isOversized(file));

    const columns = [
        {
            key: 'cover_image' as const,
            header: t('pages.projects.coverImage'),
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
            header: t('pages.projects.projectTitle'),
            render: (item: Project) => getDisplayText(item.title, '-')
        },
        {
            key: 'badge' as const,
            header: t('pages.projects.badge'),
            render: (item: Project) => (
                <span className="badge">{getDisplayText(item.badge, '-')}</span>
            )
        },
        {
            key: 'gallery' as const,
            header: t('pages.projects.gallery'),
            render: (item: Project) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <CustomButton
                        size="sm"
                        variant="secondary"
                        icon={<FiImage />}
                        onClick={() => handleOpenGallery(item)}
                    >
                        {t('pages.projects.images')}
                    </CustomButton>
                </div>
            )
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('pages.projects.title')}</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    {t('common.add')}
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={projects}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage={t('common.noData')}
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? t('pages.projects.editProject') : t('pages.projects.newProject')}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-col">
                            <TranslatableInput
                                name="title"
                                label={t('pages.projects.projectTitle')}
                                value={formData.title}
                                onChange={(value) => setFormData({ ...formData, title: value })}
                                placeholder={t('pages.projects.projectTitle')}
                                required
                            />
                        </div>
                        <div className="form-col">
                            <TranslatableInput
                                name="badge"
                                label={t('pages.projects.badge')}
                                value={formData.badge}
                                onChange={(value) => setFormData({ ...formData, badge: value })}
                                placeholder="məs: Yeni, VIP, Tamamlandı"
                            />
                        </div>
                    </div>

                    <TranslatableInput
                        name="details"
                        label={t('pages.projects.details')}
                        value={formData.details}
                        onChange={(value) => setFormData({ ...formData, details: value })}
                        type="textarea"
                        placeholder={t('pages.projects.details')}
                        rows={4}
                        required
                    />

                    <div className="form-row">
                        <div className="form-col">
                            <TranslatableInput
                                name="address"
                                label={t('pages.projects.address')}
                                value={formData.address}
                                onChange={(value) => setFormData({ ...formData, address: value })}
                                placeholder={t('pages.projects.address')}
                            />
                        </div>
                        <div className="form-col">
                            <CustomInput
                                name="map_url"
                                label={t('pages.projects.mapUrl')}
                                value={formData.map_url}
                                onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                                placeholder="Google Maps URL"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FiImage style={{ marginRight: '8px' }} />
                            {t('pages.projects.coverImage')}
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
                            {t('common.cancel')}
                        </CustomButton>
                        <CustomButton type="submit" loading={formLoading}>
                            {selectedItem ? t('common.update') : t('common.add')}
                        </CustomButton>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={galleryModalOpen}
                onClose={() => setGalleryModalOpen(false)}
                title={`${t('pages.projects.gallery')} - ${getDisplayText(galleryProject?.title, t('sidebar.projects'))}`}
                size="lg"
            >
                <div className="gallery-modal-content">
                    <div className="gallery-section">
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            {t('pages.projects.existingImages')} ({galleryImages.length})
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
                                <p>{t('pages.projects.noImages')}</p>
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

                    <div className="gallery-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--medium-gray)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            {t('pages.projects.addNewImages')}
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
                                {t('pages.projects.addImages')}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {galleryFiles.length > 0 && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'var(--light-gray)',
                                borderRadius: '8px'
                            }}>
                                <p style={{ marginBottom: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {t('pages.projects.selectedImages')} ({galleryFiles.length}):
                                </p>

                                {/* Warning if any file is oversized */}
                                {hasOversizedFiles && (
                                    <div style={{
                                        marginBottom: '1rem',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid #EF4444',
                                        borderRadius: '8px',
                                        color: '#DC2626',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <FiImage size={18} />
                                        <span>{t('pages.projects.fileTooLarge')}</span>
                                    </div>
                                )}

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    {galleryFiles.map((file, index) => {
                                        const oversized = isOversized(file);
                                        const borderColor = oversized ? '#EF4444' : '#1B5E3A';

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    position: 'relative',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    aspectRatio: '4/3',
                                                    border: `3px solid ${borderColor}`,
                                                    background: '#fff',
                                                    boxShadow: oversized ? '0 0 8px rgba(239, 68, 68, 0.3)' : 'none'
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

                                                {/* File size label */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '0',
                                                        left: '0',
                                                        right: '0',
                                                        padding: '4px 8px',
                                                        background: oversized
                                                            ? 'linear-gradient(to top, rgba(239, 68, 68, 0.95), rgba(239, 68, 68, 0.8))'
                                                            : 'linear-gradient(to top, rgba(27, 94, 58, 0.95), rgba(27, 94, 58, 0.8))',
                                                        color: '#fff',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    {formatFileSize(file.size)}
                                                    {oversized && (
                                                        <span style={{
                                                            display: 'block',
                                                            fontSize: '0.6rem',
                                                            fontWeight: 400,
                                                            marginTop: '1px'
                                                        }}>
                                                            Max: 1 MB
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Delete button */}
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
                                        );
                                    })}
                                </div>

                                <CustomButton
                                    icon={<FiPlus />}
                                    onClick={handleAddGalleryImages}
                                    loading={galleryLoading}
                                    disabled={hasOversizedFiles}
                                >
                                    {t('pages.projects.uploadImages')}
                                </CustomButton>

                                {hasOversizedFiles && (
                                    <p style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: '#DC2626'
                                    }}>
                                        {t('pages.projects.removeOversizedFiles')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Modal >

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={t('pages.projects.deleteConfirm')}
                loading={formLoading}
            />
        </div >
    );
};

export default Projects;
