import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { aboutAPI, languagesAPI } from '../../services/api';
import type { Language, MultiLang } from '../../types';
import { ensureMultiLang } from '../../utils/lang';
import CustomButton from '../../components/ui/CustomButton';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiSave } from 'react-icons/fi';
import './CrudPage.scss';

const About: React.FC = () => {
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: {} as MultiLang,
        info: {} as MultiLang,
        description: {} as MultiLang,
        our_mission: {} as MultiLang,
        our_vision: {} as MultiLang,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentImage, setCurrentImage] = useState('');

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

    const fetchData = async () => {
        try {
            const response = await aboutAPI.get();
            if (response.data) {
                const data = response.data;
                const langs = await fetchLanguages();
                setFormData({
                    title: ensureMultiLang(data.title, langs),
                    info: ensureMultiLang(data.info, langs),
                    description: ensureMultiLang(data.description, langs),
                    our_mission: ensureMultiLang(data.our_mission, langs),
                    our_vision: ensureMultiLang(data.our_vision, langs),
                });
                setCurrentImage(data.image || '');
            }
        } catch (error) {
            showToast('error', 'Məlumatlar yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

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

            await aboutAPI.update(data);
            showToast('success', 'Məlumatlar yeniləndi');
            fetchData();
        } catch (error) {
            showToast('error', 'Yadda saxlamaq mümkün olmadı');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return <div className="loader">Yüklənir...</div>;

    return (
        <div className="page-content about-page">
            <div className="page-header">
                <h1 className="page-title">Haqqımızda Redaktəsi</h1>
            </div>

            <form onSubmit={handleSubmit} className="about-form">
                <div className="card">
                    <div className="form-grid">
                        <MultiLangInput
                            label="Başlıq"
                            name="title"
                            value={formData.title}
                            onChange={(val) => setFormData({ ...formData, title: val })}
                            languages={languages}
                        />

                        <MultiLangInput
                            label="Qısa Məlumat"
                            name="info"
                            value={formData.info}
                            onChange={(val) => setFormData({ ...formData, info: val })}
                            type="textarea"
                            rows={3}
                            languages={languages}
                        />

                        <MultiLangInput
                            label="Ətraflı Təsvir"
                            name="description"
                            value={formData.description}
                            onChange={(val) => setFormData({ ...formData, description: val })}
                            type="textarea"
                            rows={5}
                            languages={languages}
                        />

                        <div className="mission-vision-grid">
                            <MultiLangInput
                                label="Missiyamız"
                                name="our_mission"
                                value={formData.our_mission}
                                onChange={(val) => setFormData({ ...formData, our_mission: val })}
                                type="textarea"
                                rows={3}
                                languages={languages}
                            />
                            <MultiLangInput
                                label="Vizyonumuz"
                                name="our_vision"
                                value={formData.our_vision}
                                onChange={(val) => setFormData({ ...formData, our_vision: val })}
                                type="textarea"
                                rows={3}
                                languages={languages}
                            />
                        </div>

                        <div className="form-group">
                            <label>Haqqımızda Şəkli</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                className="file-input"
                            />
                            {(imageFile || currentImage) && (
                                <div className="image-preview-wrapper mt-2">
                                    <img
                                        src={imageFile ? URL.createObjectURL(imageFile) : currentImage}
                                        alt="About"
                                        className="about-preview-img"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions mt-4">
                        <CustomButton
                            type="submit"
                            icon={<FiSave />}
                            loading={formLoading}
                            fullWidth
                        >
                            Dəyişiklikləri Yadda Saxla
                        </CustomButton>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default About;
