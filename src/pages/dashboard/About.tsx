import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { aboutAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Loader from '../../components/ui/Loader';
import { FiSave, FiImage } from 'react-icons/fi';
import './CrudPage.scss';

interface AboutFormData {
    title: TranslatedString;
    info: TranslatedString;
    description: TranslatedString;
    our_mission: TranslatedString;
    our_vision: TranslatedString;
}

const About: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<AboutFormData>({
        title: {},
        info: {},
        description: {},
        our_mission: {},
        our_vision: {},
    });
    const [currentImage, setCurrentImage] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { showToast } = useToast();
    const { languages } = useLanguages();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await aboutAPI.get();
            if (response.data) {
                setFormData({
                    title: response.data.title || {},
                    info: response.data.info || {},
                    description: response.data.description || {},
                    our_mission: response.data.our_mission || {},
                    our_vision: response.data.our_vision || {},
                });
                setCurrentImage(response.data.image || '');
            } else {
                setFormData({
                    title: createEmptyTranslation(languages),
                    info: createEmptyTranslation(languages),
                    description: createEmptyTranslation(languages),
                    our_mission: createEmptyTranslation(languages),
                    our_vision: createEmptyTranslation(languages),
                });
            }
        } catch {
            showToast('error', 'Haqqımızda bölməsi yüklənə bilmədi');
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

        if (!hasTitle) {
            showToast('error', 'Ən azı bir dildə başlıq daxil edin');
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));
            data.append('info', JSON.stringify(formData.info));
            data.append('description', JSON.stringify(formData.description));
            data.append('our_mission', JSON.stringify(formData.our_mission));
            data.append('our_vision', JSON.stringify(formData.our_vision));

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (currentImage) {
                await aboutAPI.update(data);
            } else {
                await aboutAPI.create(data);
            }

            showToast('success', 'Haqqımızda bölməsi yeniləndi');
            fetchData();
            setImageFile(null);
        } catch {
            showToast('error', 'Yeniləmə uğursuz oldu');
        } finally {
            setSaving(false);
        }
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
                <h1 className="page-title">Haqqımızda</h1>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-col">
                                <TranslatableInput
                                    name="title"
                                    label="Başlıq"
                                    value={formData.title}
                                    onChange={(value) => setFormData({ ...formData, title: value })}
                                    placeholder="Şirkət başlığı"
                                    required
                                />
                            </div>
                            <div className="form-col">
                                <TranslatableInput
                                    name="info"
                                    label="Qısa Məlumat"
                                    value={formData.info}
                                    onChange={(value) => setFormData({ ...formData, info: value })}
                                    placeholder="Qısa şirkət məlumatı"
                                />
                            </div>
                        </div>

                        <TranslatableInput
                            name="description"
                            label="Ətraflı Təsvir"
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            type="textarea"
                            placeholder="Şirkət haqqında ətraflı məlumat"
                            rows={5}
                        />

                        <div className="form-row">
                            <div className="form-col">
                                <TranslatableInput
                                    name="our_mission"
                                    label="Missiyamız"
                                    value={formData.our_mission}
                                    onChange={(value) => setFormData({ ...formData, our_mission: value })}
                                    type="textarea"
                                    placeholder="Şirkət missiyası"
                                    rows={3}
                                />
                            </div>
                            <div className="form-col">
                                <TranslatableInput
                                    name="our_vision"
                                    label="Vizyonumuz"
                                    value={formData.our_vision}
                                    onChange={(value) => setFormData({ ...formData, our_vision: value })}
                                    type="textarea"
                                    placeholder="Şirkət vizyonu"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <FiImage style={{ marginRight: '8px' }} />
                                Şəkil
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                className="file-input"
                            />
                            {(currentImage || imageFile) && (
                                <div className="preview-image-container" style={{ marginTop: '1rem' }}>
                                    <img
                                        src={imageFile ? URL.createObjectURL(imageFile) : currentImage}
                                        alt="Preview"
                                        className="preview-image"
                                        style={{ maxHeight: '200px' }}
                                    />
                                </div>
                            )}
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

export default About;
