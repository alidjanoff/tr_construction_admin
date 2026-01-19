import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { heroAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Loader from '../../components/ui/Loader';
import { FiSave, FiImage, FiTrash2, FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

interface HeroFormData {
    title: TranslatedString;
    info: TranslatedString;
}

const Hero: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<HeroFormData>({ title: {}, info: {} });
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

    const { showToast } = useToast();
    const { languages } = useLanguages();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await heroAPI.getAll();
            if (response.data) {
                setFormData({
                    title: response.data.title || {},
                    info: response.data.info || {},
                });
                setCurrentImages(response.data.images || []);
            } else {
                setFormData({
                    title: createEmptyTranslation(languages),
                    info: createEmptyTranslation(languages),
                });
            }
        } catch {
            showToast('error', 'Hero bölməsi yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    }, [languages, showToast]);

    useEffect(() => {
        if (languages.length > 0) {
            fetchData();
        }
    }, [languages, fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasTitle = Object.values(formData.title).some(v => v && v.trim());
        const hasInfo = Object.values(formData.info).some(v => v && v.trim());

        if (!hasTitle || !hasInfo) {
            showToast('error', 'Ən azı bir dildə başlıq və məlumat daxil edin');
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));
            data.append('info', JSON.stringify(formData.info));

            // Add new images
            newImageFiles.forEach((file) => {
                data.append('images', file);
            });

            // Check if we have existing images
            if (currentImages.length > 0 || newImageFiles.length > 0) {
                await heroAPI.update(data);
            } else {
                await heroAPI.create(data);
            }

            showToast('success', 'Hero bölməsi yeniləndi');
            fetchData();
            setNewImageFiles([]);
        } catch {
            showToast('error', 'Yeniləmə uğursuz oldu');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setNewImageFiles([...newImageFiles, ...Array.from(files)]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="page-content">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Hero Bölməsi</h1>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <TranslatableInput
                            name="title"
                            label="Başlıq"
                            value={formData.title}
                            onChange={(value) => setFormData({ ...formData, title: value })}
                            placeholder="Ana səhifə başlığı"
                            required
                        />

                        <TranslatableInput
                            name="info"
                            label="Alt başlıq / Məlumat"
                            value={formData.info}
                            onChange={(value) => setFormData({ ...formData, info: value })}
                            type="textarea"
                            placeholder="Ana səhifə məlumatı"
                            rows={3}
                            required
                        />

                        <div className="form-group">
                            <label>
                                <FiImage style={{ marginRight: '8px' }} />
                                Slider Şəkilləri
                            </label>

                            {/* Current images */}
                            {currentImages.length > 0 && (
                                <div className="image-gallery">
                                    {currentImages.map((img, index) => (
                                        <div key={index} className="gallery-item">
                                            <img src={img} alt={`Slide ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New images preview */}
                            {newImageFiles.length > 0 && (
                                <div className="image-gallery" style={{ marginTop: '1rem' }}>
                                    <h4>Yeni Şəkillər:</h4>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        {newImageFiles.map((file, index) => (
                                            <div key={index} className="gallery-item" style={{ position: 'relative' }}>
                                                <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => removeNewImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        right: '4px',
                                                        background: 'rgba(239, 68, 68, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        padding: '4px',
                                                        cursor: 'pointer',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '1rem' }}>
                                <label className="file-upload-btn">
                                    <FiPlus />
                                    Şəkil Əlavə Et
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="button-group right" style={{ marginTop: '1.5rem' }}>
                            <CustomButton type="submit" icon={<FiSave />} loading={saving}>
                                Yadda saxla
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Hero;
