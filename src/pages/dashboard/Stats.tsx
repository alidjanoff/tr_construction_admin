import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { statsAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import type { Stat, TranslatedString } from '../../types';
import { createEmptyTranslation, getTranslationValue } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

interface StatFormData {
    count: TranslatedString;
    detail: TranslatedString;
}

const Stats: React.FC = () => {
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Stat | null>(null);
    const [formData, setFormData] = useState<StatFormData>({ count: {}, detail: {} });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();
    const { languages } = useLanguages();

    const fetchData = React.useCallback(async () => {
        try {
            const response = await statsAPI.getAll();
            setStats(response.data || []);
        } catch {
            showToast('error', 'Statistikalar yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({
            count: createEmptyTranslation(languages),
            detail: createEmptyTranslation(languages),
        });
        setModalOpen(true);
    };

    const handleEdit = (item: Stat) => {
        setSelectedItem(item);
        setFormData({
            count: item.count || {},
            detail: item.detail || {},
        });
        setModalOpen(true);
    };

    const handleDelete = (item: Stat) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasCount = Object.values(formData.count).some(v => v && v.trim());
        const hasDetail = Object.values(formData.detail).some(v => v && v.trim());

        if (!hasCount || !hasDetail) {
            showToast('error', 'Ən azı bir dildə rəqəm və detalı daxil edin');
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await statsAPI.update({
                    id: selectedItem.id,
                    count: formData.count,
                    detail: formData.detail,
                });
                showToast('success', 'Statistika yeniləndi');
            } else {
                await statsAPI.create({
                    count: formData.count,
                    detail: formData.detail,
                });
                showToast('success', 'Statistika əlavə edildi');
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
            await statsAPI.delete(selectedItem.id);
            showToast('success', 'Statistika silindi');
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
            key: 'count' as const,
            header: 'Rəqəm',
            render: (item: Stat) => <strong>{getTranslationValue(item.count, 'az')}</strong>
        },
        {
            key: 'detail' as const,
            header: 'Detal',
            render: (item: Stat) => getTranslationValue(item.detail, 'az')
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Statistika</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={stats}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="Statistika tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Statistikanı Redaktə Et' : 'Yeni Statistika'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <TranslatableInput
                        name="count"
                        label="Rəqəm"
                        value={formData.count}
                        onChange={(value) => setFormData({ ...formData, count: value })}
                        placeholder="məs: 150+, 10+, 200"
                        required
                    />

                    <TranslatableInput
                        name="detail"
                        label="Detal"
                        value={formData.detail}
                        onChange={(value) => setFormData({ ...formData, detail: value })}
                        placeholder="məs: Uğurlu Layihə, İllik Təcrübə"
                        required
                    />

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
                message={`"${getTranslationValue(selectedItem?.count, 'az')}" statistikasını silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Stats;
