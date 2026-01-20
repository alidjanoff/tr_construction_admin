import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { heroAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import { useDisplayText } from '../../hooks/useDisplayText';
import type { TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Loader from '../../components/ui/Loader';
import { FiSave, FiImage, FiTrash2, FiPlus, FiEdit2, FiX } from 'react-icons/fi';
import './CrudPage.scss';

interface HeroSlide {
    id: string;
    title: TranslatedString;
    info: TranslatedString;
    image_url: string;
    button_text: TranslatedString;
    button_url: string;
}

interface HeroFormData {
    title: TranslatedString;
    info: TranslatedString;
    button_text: TranslatedString;
    button_url: string;
}

const Hero: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<HeroFormData>({
        title: {},
        info: {},
        button_text: {},
        button_url: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { t } = useTranslation();
    const { showToast } = useToast();
    const { languages } = useLanguages();
    const { getDisplayText } = useDisplayText();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await heroAPI.getAll();
            const data = Array.isArray(response.data) ? response.data : [];
            setSlides(data);
        } catch {
            showToast('error', t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (languages.length > 0) {
            fetchData();
        }
    }, [languages, fetchData]);

    const resetForm = () => {
        setFormData({
            title: createEmptyTranslation(languages),
            info: createEmptyTranslation(languages),
            button_text: createEmptyTranslation(languages),
            button_url: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingSlide(null);
        setIsCreating(false);
    };

    const openCreateForm = () => {
        resetForm();
        setIsCreating(true);
    };

    const openEditForm = (slide: HeroSlide) => {
        setFormData({
            title: slide.title || createEmptyTranslation(languages),
            info: slide.info || createEmptyTranslation(languages),
            button_text: slide.button_text || createEmptyTranslation(languages),
            button_url: slide.button_url || ''
        });
        setImagePreview(slide.image_url || null);
        setImageFile(null);
        setEditingSlide(slide);
        setIsCreating(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasTitle = Object.values(formData.title).some(v => v && v.trim());
        const hasInfo = Object.values(formData.info).some(v => v && v.trim());

        if (!hasTitle || !hasInfo) {
            showToast('error', 'Ən azı bir dildə başlıq və məlumat daxil edin');
            return;
        }

        if (isCreating && !imageFile) {
            showToast('error', 'Yeni slide üçün şəkil tələb olunur');
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));
            data.append('info', JSON.stringify(formData.info));
            data.append('button_text', JSON.stringify(formData.button_text));
            data.append('button_url', formData.button_url);

            if (imageFile) {
                data.append('images', imageFile);
            }

            if (editingSlide) {
                await heroAPI.update(editingSlide.id, data);
                showToast('success', 'Slide yeniləndi');
            } else {
                await heroAPI.create(data);
                showToast('success', 'Yeni slide yaradıldı');
            }

            resetForm();
            fetchData();
        } catch {
            showToast('error', editingSlide ? 'Yeniləmə uğursuz oldu' : 'Yaratma uğursuz oldu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu slide-ı silmək istədiyinizə əminsiniz?')) {
            return;
        }

        setDeleting(id);
        try {
            await heroAPI.delete(id);
            showToast('success', 'Slide silindi');
            fetchData();
            if (editingSlide?.id === id) {
                resetForm();
            }
        } catch {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setDeleting(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(editingSlide?.image_url || null);
    };

    if (loading) {
        return (
            <div className="page-content">
                <Loader size="lg" />
            </div>
        );
    }

    const showForm = isCreating || editingSlide;

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('pages.hero.title')}</h1>
                {!showForm && (
                    <CustomButton icon={<FiPlus />} onClick={openCreateForm}>
                        {t('pages.hero.newSlide')}
                    </CustomButton>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>
                            {editingSlide ? t('pages.hero.editSlide') : t('pages.hero.newSlide')}
                        </h3>
                        <button
                            type="button"
                            onClick={resetForm}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <TranslatableInput
                                name="title"
                                label="Başlıq"
                                value={formData.title}
                                onChange={(value) => setFormData({ ...formData, title: value })}
                                placeholder="Slide başlığı"
                                required
                            />

                            <TranslatableInput
                                name="info"
                                label="Alt başlıq / Məlumat"
                                value={formData.info}
                                onChange={(value) => setFormData({ ...formData, info: value })}
                                type="textarea"
                                placeholder="Slide məlumatı"
                                rows={3}
                                required
                            />

                            <TranslatableInput
                                name="button_text"
                                label="Düymə mətni"
                                value={formData.button_text}
                                onChange={(value) => setFormData({ ...formData, button_text: value })}
                                placeholder="Ətraflı"
                            />

                            <div className="form-group">
                                <label>Düymə linki</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.button_url}
                                    onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                                    placeholder="/haqqimizda və ya https://example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FiImage style={{ marginRight: '8px' }} />
                                    Şəkil {isCreating && <span style={{ color: 'var(--danger)' }}>*</span>}
                                </label>

                                {imagePreview && (
                                    <div className="image-gallery" style={{ marginBottom: '1rem' }}>
                                        <div className="gallery-item" style={{ position: 'relative', maxWidth: '300px' }}>
                                            <img src={imagePreview} alt="Slide preview" style={{ borderRadius: '8px' }} />
                                            {imageFile && (
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        background: 'rgba(239, 68, 68, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        padding: '6px',
                                                        cursor: 'pointer',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <label className="file-upload-btn">
                                    <FiPlus />
                                    {imagePreview ? 'Şəkili dəyiş' : 'Şəkil seç'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            <div className="button-group right" style={{ marginTop: '1.5rem' }}>
                                <CustomButton
                                    type="button"
                                    variant="secondary"
                                    onClick={resetForm}
                                >
                                    Ləğv et
                                </CustomButton>
                                <CustomButton type="submit" icon={<FiSave />} loading={saving}>
                                    {editingSlide ? 'Yenilə' : 'Yarat'}
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Slides List */}
            <div className="card">
                <div className="card-header">
                    <h3 style={{ margin: 0 }}>Slide-lar ({slides.length})</h3>
                </div>
                <div className="card-body">
                    {slides.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <FiImage size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Heç bir slide yoxdur</p>
                            <div style={{ marginTop: '1rem' }}>
                                <CustomButton icon={<FiPlus />} onClick={openCreateForm}>
                                    İlk Slide-ı Yarat
                                </CustomButton>
                            </div>
                        </div>
                    ) : (
                        <div className="slides-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {slides.map((slide) => (
                                <div
                                    key={slide.id}
                                    className="slide-card"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: editingSlide?.id === slide.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {slide.image_url && (
                                        <div style={{
                                            height: '180px',
                                            overflow: 'hidden',
                                            background: 'var(--bg-tertiary)'
                                        }}>
                                            <img
                                                src={slide.image_url}
                                                alt={getDisplayText(slide.title, 'Slide')}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div style={{ padding: '1rem' }}>
                                        <h4 style={{
                                            margin: '0 0 0.5rem 0',
                                            fontSize: '1rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {getDisplayText(slide.title, 'Başlıqsız')}
                                        </h4>
                                        <p style={{
                                            margin: '0 0 1rem 0',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {getDisplayText(slide.info, 'Məlumat yoxdur')}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <CustomButton
                                                size="sm"
                                                icon={<FiEdit2 />}
                                                onClick={() => openEditForm(slide)}
                                            >
                                                Redaktə
                                            </CustomButton>
                                            <CustomButton
                                                size="sm"
                                                variant="danger"
                                                icon={<FiTrash2 />}
                                                loading={deleting === slide.id}
                                                onClick={() => handleDelete(slide.id)}
                                            >
                                                Sil
                                            </CustomButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hero;
