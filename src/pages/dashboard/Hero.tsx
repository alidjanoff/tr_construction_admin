import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { heroAPI, languagesAPI } from '../../services/api';
import type { Hero as HeroType, Language, MultiLang } from '../../types';
import { createEmptyMultiLang, ensureMultiLang } from '../../utils/lang';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiPlus, FiImage } from 'react-icons/fi';
import './CrudPage.scss';

const Hero: React.FC = () => {
    const [slides, setSlides] = useState<HeroType[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<HeroType | null>(null);
    const [formData, setFormData] = useState({
        title: {} as MultiLang,
        info: {} as MultiLang,
        button_text: {} as MultiLang,
        button_url: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
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

    const fetchData = async () => {
        try {
            const response = await heroAPI.getAll();
            setSlides(response.data || []);
        } catch (error) {
            showToast('error', 'Slaydlar yüklənə bilmədi');
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
            info: createEmptyMultiLang(languages),
            button_text: createEmptyMultiLang(languages),
            button_url: '',
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleEdit = (item: HeroType) => {
        setSelectedItem(item);
        setFormData({
            title: ensureMultiLang(item.title, languages),
            info: ensureMultiLang(item.info, languages),
            button_text: ensureMultiLang(item.button_text, languages),
            button_url: item.button_url || '',
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleDelete = (item: HeroType) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormLoading(true);
        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));
            data.append('info', JSON.stringify(formData.info));
            data.append('button_text', JSON.stringify(formData.button_text));
            data.append('button_url', formData.button_url);

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (selectedItem) {
                data.append('id', selectedItem.id);
                await heroAPI.update(data);
                showToast('success', 'Slayd yeniləndi');
            } else {
                await heroAPI.create(data);
                showToast('success', 'Slayd əlavə edildi');
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
            await heroAPI.delete(selectedItem.id);
            showToast('success', 'Slayd silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch (error) {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const getDisplayValue = (multiLang: MultiLang) => {
        if (!multiLang) return '-';
        return multiLang.az || multiLang.en || Object.values(multiLang).find(v => v) || '-';
    };

    const columns = [
        {
            key: 'image_url' as const,
            header: 'Şəkil',
            render: (item: HeroType) => (
                <div className="table-img-container">
                    {item.image_url ? (
                        <img src={item.image_url} alt="" className="table-img" />
                    ) : (
                        <div className="no-img"><FiImage /></div>
                    )}
                </div>
            )
        },
        {
            key: 'title' as const,
            header: 'Başlıq',
            render: (item: HeroType) => getDisplayValue(item.title)
        },
        {
            key: 'button_url' as const,
            header: 'Keçid URL',
            render: (item: HeroType) => <span className="text-muted">{item.button_url || '-'}</span>
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Hero Slayder</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd} disabled={languages.length === 0}>
                    Yeni Slayd
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={slides}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Slayd yoxdur"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Slaydı Redaktə Et' : 'Yeni Slayd'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <MultiLangInput
                            label="Başlıq"
                            name="title"
                            value={formData.title}
                            onChange={(val) => setFormData({ ...formData, title: val })}
                            placeholder="Slayd başlığı"
                            languages={languages}
                        />

                        <MultiLangInput
                            label="Məlumat"
                            name="info"
                            value={formData.info}
                            onChange={(val) => setFormData({ ...formData, info: val })}
                            placeholder="Qısa məlumat"
                            type="textarea"
                            rows={3}
                            languages={languages}
                        />

                        <MultiLangInput
                            label="Düymə Mətni"
                            name="button_text"
                            value={formData.button_text}
                            onChange={(val) => setFormData({ ...formData, button_text: val })}
                            placeholder="Məs: Ətraflı"
                            languages={languages}
                        />

                        <CustomInput
                            name="button_url"
                            label="Düymə Keçidi (URL)"
                            value={formData.button_url}
                            onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                            placeholder="Məs: /services"
                        />
                    </div>

                    <div className="form-group mt-4">
                        <label>Slayd Şəkli</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        {(imageFile || selectedItem?.image_url) && (
                            <div className="preview-container">
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : selectedItem?.image_url}
                                    alt="Preview"
                                    className="img-preview"
                                />
                            </div>
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

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message="Bu slaydı silmək istədiyinizə əminsiniz?"
                loading={formLoading}
            />
        </div>
    );
};

export default Hero;
