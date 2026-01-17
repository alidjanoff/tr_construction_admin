import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { projectsAPI, languagesAPI } from '../../services/api';
import type { Project, Language, MultiLang } from '../../types';
import { createEmptyMultiLang, ensureMultiLang } from '../../utils/lang';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiPlus, FiImage, FiTrash2 } from 'react-icons/fi';
import './CrudPage.scss';

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        title: {} as MultiLang,
        details: {} as MultiLang,
        badge: {} as MultiLang,
        address: {} as MultiLang,
        map_url: '',
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
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

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const response = await projectsAPI.getAll(page);
            if (response.data?.data) {
                setProjects(response.data.data);
                setPagination({
                    page: response.data.pagination.page,
                    pages: response.data.pagination.pages
                });
            }
        } catch (error) {
            showToast('error', 'Layihələr yüklənə bilmədi');
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
            details: createEmptyMultiLang(languages),
            badge: createEmptyMultiLang(languages),
            address: createEmptyMultiLang(languages),
            map_url: '',
        });
        setCoverFile(null);
        setModalOpen(true);
    };

    const handleEdit = async (item: Project) => {
        setFormLoading(true);
        try {
            const res = await projectsAPI.getOne(item.id);
            const fullItem = res.data;
            setSelectedItem(fullItem);
            setFormData({
                title: ensureMultiLang(fullItem.title, languages),
                details: ensureMultiLang(fullItem.details, languages),
                badge: ensureMultiLang(fullItem.badge, languages),
                address: ensureMultiLang(fullItem.address, languages),
                map_url: fullItem.map_url || '',
            });
            setCoverFile(null);
            setModalOpen(true);
        } catch (error) {
            showToast('error', 'Məlumat yüklənmədi');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (item: Project) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleGallery = (item: Project) => {
        setSelectedItem(item);
        setGalleryOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));
            data.append('details', JSON.stringify(formData.details));
            data.append('badge', JSON.stringify(formData.badge));
            data.append('address', JSON.stringify(formData.address));
            data.append('map_url', formData.map_url);

            if (coverFile) data.append('cover_image', coverFile);

            if (selectedItem) {
                data.append('id', selectedItem.id);
                await projectsAPI.update(data);
                showToast('success', 'Layihə yeniləndi');
            } else {
                await projectsAPI.create(data);
                showToast('success', 'Layihə əlavə edildi');
            }

            setModalOpen(false);
            fetchData(pagination.page);
        } catch (error: any) {
            if (error.response?.data?.message === 'DUPLICATE_TITLE') {
                showToast('error', 'Bu başlıqda layihə artıq mövcuddur');
            } else {
                showToast('error', 'Əməliyyat uğursuz oldu');
            }
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
            fetchData(pagination.page);
        } catch (error) {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUploadGallery = async () => {
        if (!selectedItem || !galleryFiles) return;
        setFormLoading(true);
        try {
            const data = new FormData();
            data.append('id', selectedItem.id);
            Array.from(galleryFiles).forEach(file => {
                data.append('images', file);
            });
            await projectsAPI.uploadGallery(data);
            showToast('success', 'Şəkillər əlavə olundu');
            setGalleryFiles(null);
            const res = await projectsAPI.getOne(selectedItem.id);
            setSelectedItem(res.data);
        } catch (error) {
            showToast('error', 'Yükləmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteGalleryImage = async (imageId: string) => {
        if (!selectedItem) return;
        try {
            await projectsAPI.deleteGalleryImage(selectedItem.id, imageId);
            showToast('success', 'Şəkil silindi');
            const res = await projectsAPI.getOne(selectedItem.id);
            setSelectedItem(res.data);
        } catch (error) {
            showToast('error', 'Silmək mümkün olmadı');
        }
    };

    const getDisplayValue = (multiLang: MultiLang) => {
        if (!multiLang) return '-';
        return multiLang.az || multiLang.en || Object.values(multiLang).find(v => v) || '-';
    };

    const actions = (item: Project) => (
        <>
            <CustomButton size="sm" variant="secondary" onClick={() => handleGallery(item)} title="Qaleriya">
                <FiImage />
            </CustomButton>
        </>
    );

    const columns = [
        {
            key: 'cover_image' as const,
            header: 'Kaver',
            render: (item: Project) => (
                item.cover_image ? <img src={item.cover_image} alt="" className="table-img" /> : '-'
            )
        },
        {
            key: 'title' as const,
            header: 'Başlıq',
            render: (item: Project) => (
                <div>
                    <strong>{getDisplayValue(item.title)}</strong>
                    {item.slug && <div className="slug-text">/{item.slug}</div>}
                </div>
            )
        },
        {
            key: 'address' as const,
            header: 'Ünvan',
            render: (item: Project) => getDisplayValue(item.address)
        },
        {
            key: 'badge' as const,
            header: 'Nişan',
            render: (item: Project) => <span className="badge-ui">{getDisplayValue(item.badge)}</span>
        }
    ];

    return (
        <div className="page-content projects-page">
            <div className="page-header">
                <h1 className="page-title">Layihələr</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd} disabled={languages.length === 0}>
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
                    renderActions={actions}
                />

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="pagination-container">
                        <CustomButton
                            size="sm"
                            variant="secondary"
                            disabled={pagination.page === 1}
                            onClick={() => fetchData(pagination.page - 1)}
                        >
                            Əvvəlki
                        </CustomButton>
                        <span className="page-info">Səhifə {pagination.page} / {pagination.pages}</span>
                        <CustomButton
                            size="sm"
                            variant="secondary"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => fetchData(pagination.page + 1)}
                        >
                            Növbəti
                        </CustomButton>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Layihəni Redaktə Et' : 'Yeni Layihə'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <MultiLangInput
                            label="Layihə Adı"
                            name="title"
                            value={formData.title}
                            onChange={(val) => setFormData({ ...formData, title: val })}
                            languages={languages}
                            required
                        />
                        <MultiLangInput
                            label="Ünvan"
                            name="address"
                            value={formData.address}
                            onChange={(val) => setFormData({ ...formData, address: val })}
                            languages={languages}
                        />
                        <MultiLangInput
                            label="Nişan (Badge)"
                            name="badge"
                            value={formData.badge}
                            onChange={(val) => setFormData({ ...formData, badge: val })}
                            placeholder="Məs: Tamamlanıb"
                            languages={languages}
                        />
                        <CustomInput
                            label="Map URL / Koordinatlar"
                            name="map_url"
                            value={formData.map_url}
                            onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                            placeholder="Enlik, Uzunluq və ya Maps linki"
                        />
                    </div>

                    <MultiLangInput
                        label="Ətraflı Məlumat"
                        name="details"
                        value={formData.details}
                        onChange={(val) => setFormData({ ...formData, details: val })}
                        type="textarea"
                        rows={5}
                        languages={languages}
                    />

                    <div className="form-group mt-3">
                        <label>Kaver Şəkli</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        {(coverFile || selectedItem?.cover_image) && (
                            <img
                                src={coverFile ? URL.createObjectURL(coverFile) : selectedItem?.cover_image}
                                alt="Kaver"
                                className="img-preview mt-2"
                            />
                        )}
                    </div>

                    <div className="button-group right">
                        <CustomButton variant="secondary" onClick={() => setModalOpen(false)}>
                            Ləğv et
                        </CustomButton>
                        <CustomButton type="submit" loading={formLoading}>
                            {selectedItem ? 'Yenilə' : 'Yadda saxla'}
                        </CustomButton>
                    </div>
                </form>
            </Modal>

            {/* Gallery Modal */}
            <Modal
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                title={`Qaleriya: ${getDisplayValue(selectedItem?.title || {} as MultiLang)}`}
                size="lg"
            >
                <div className="gallery-manager">
                    <div className="upload-section">
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setGalleryFiles(e.target.files)}
                            className="file-input"
                        />
                        <CustomButton
                            size="sm"
                            disabled={!galleryFiles}
                            onClick={handleUploadGallery}
                            loading={formLoading}
                        >
                            Yüklə ({galleryFiles?.length || 0})
                        </CustomButton>
                    </div>

                    <div className="gallery-grid mt-4">
                        {selectedItem?.image_gallery.map((img) => (
                            <div key={img.id} className="gallery-item">
                                <img src={img.image_url} alt="" />
                                <button className="delete-btn" onClick={() => handleDeleteGalleryImage(img.id)}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                        {selectedItem?.image_gallery.length === 0 && <p className="empty">Şəkil yoxdur</p>}
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message="Bu layihəni silmək istədiyinizə əminsiniz?"
                loading={formLoading}
            />
        </div>
    );
};

export default Projects;
