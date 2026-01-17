import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { partnersAPI, languagesAPI } from '../../services/api';
import type { Partner, Language, MultiLang } from '../../types';
import { createEmptyMultiLang, ensureMultiLang } from '../../utils/lang';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

const Partners: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Partner | null>(null);
    const [formData, setFormData] = useState({
        title: {} as MultiLang,
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
            const response = await partnersAPI.getAll();
            setPartners(response.data || []);
        } catch (error) {
            showToast('error', 'Partnyorlar yüklənə bilmədi');
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
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleEdit = (item: Partner) => {
        setSelectedItem(item);
        setFormData({
            title: ensureMultiLang(item.title, languages),
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleDelete = (item: Partner) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (selectedItem) {
                data.append('id', selectedItem.id);
                await partnersAPI.update(data);
                showToast('success', 'Partnyor yeniləndi');
            } else {
                await partnersAPI.create(data);
                showToast('success', 'Partnyor əlavə edildi');
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
            await partnersAPI.delete(selectedItem.id);
            showToast('success', 'Partnyor silindi');
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
            key: 'image' as const,
            header: 'Logo',
            render: (item: Partner) => (
                item.image ? <img src={item.image} alt="" className="table-img" /> : '-'
            )
        },
        {
            key: 'title' as const,
            header: 'Adı',
            render: (item: Partner) => getDisplayValue(item.title)
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Partnyorlar</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd} disabled={languages.length === 0}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={partners}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Partnyor tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Partnyoru Redaktə Et' : 'Yeni Partnyor'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <MultiLangInput
                        label="Partnyor Adı"
                        name="title"
                        value={formData.title}
                        onChange={(val) => setFormData({ ...formData, title: val })}
                        languages={languages}
                        required
                    />

                    <div className="form-group mt-3">
                        <label>Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        {(imageFile || selectedItem?.image) && (
                            <img
                                src={imageFile ? URL.createObjectURL(imageFile) : selectedItem?.image}
                                alt="Logo"
                                className="img-preview mt-2"
                            />
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
                message="Bu partnyoru silmək istədiyinizə əminsiniz?"
                loading={formLoading}
            />
        </div>
    );
};

export default Partners;
