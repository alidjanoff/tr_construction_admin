import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { partnersAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import { useDisplayText } from '../../hooks/useDisplayText';
import type { Partner, TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

interface PartnerFormData {
    title: TranslatedString;
}

const Partners: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Partner | null>(null);
    const [formData, setFormData] = useState<PartnerFormData>({ title: {} });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();
    const { languages } = useLanguages();
    const { getDisplayText } = useDisplayText();

    const fetchData = async () => {
        try {
            const response = await partnersAPI.getAll();
            setPartners(response.data || []);
        } catch {
            showToast('error', 'Partnyorlar yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    const fetchDataCallback = React.useCallback(fetchData, [showToast]);

    useEffect(() => {
        fetchDataCallback();
    }, [fetchDataCallback]);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({
            title: createEmptyTranslation(languages),
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleEdit = (item: Partner) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || {},
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

        const hasTitle = Object.values(formData.title).some(v => v && v.trim());

        if (!hasTitle) {
            showToast('error', 'Ən azı bir dildə başlıq daxil edin');
            return;
        }

        if (!selectedItem && !imageFile) {
            showToast('error', 'Şəkil yükləyin');
            return;
        }

        setFormLoading(true);
        try {
            const data = new FormData();
            data.append('title', JSON.stringify(formData.title));

            if (selectedItem) {
                data.append('id', selectedItem.id);
            }

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (selectedItem) {
                await partnersAPI.update(data);
                showToast('success', 'Partnyor yeniləndi');
            } else {
                await partnersAPI.create(data);
                showToast('success', 'Partnyor əlavə edildi');
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
            await partnersAPI.delete(selectedItem.id);
            showToast('success', 'Partnyor silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'image' as const,
            header: 'Logo',
            render: (item: Partner) =>
                item.image ? <img src={item.image} alt="" className="table-icon" style={{ width: 60, height: 40, objectFit: 'contain' }} /> : '-'
        },
        {
            key: 'title' as const,
            header: 'Ad',
            render: (item: Partner) => getDisplayText(item.title, '-')
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Partnyorlar</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
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
                    <TranslatableInput
                        name="title"
                        label="Ad"
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                        placeholder="Partnyor şirkət adı"
                        required
                    />

                    <div className="form-group">
                        <label>Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        {selectedItem?.image && !imageFile && (
                            <img src={selectedItem.image} alt="" className="preview-image" style={{ maxHeight: 80 }} />
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
                message={`"${getDisplayText(selectedItem?.title, '')}" partnyorunu silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Partners;
