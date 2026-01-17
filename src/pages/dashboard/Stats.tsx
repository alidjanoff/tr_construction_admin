import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { statsAPI, languagesAPI } from '../../services/api';
import type { Stat, Language, MultiLang } from '../../types';
import { createEmptyMultiLang, ensureMultiLang } from '../../utils/lang';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

const Stats: React.FC = () => {
    const [stats, setStats] = useState<Stat[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Stat | null>(null);
    const [formData, setFormData] = useState({
        count: {} as MultiLang,
        detail: {} as MultiLang,
    });
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
            const response = await statsAPI.getAll();
            setStats(response.data || []);
        } catch (error) {
            showToast('error', 'Statistikalar yüklənə bilmədi');
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
            count: createEmptyMultiLang(languages),
            detail: createEmptyMultiLang(languages),
        });
        setModalOpen(true);
    };

    const handleEdit = (item: Stat) => {
        setSelectedItem(item);
        setFormData({
            count: ensureMultiLang(item.count, languages),
            detail: ensureMultiLang(item.detail, languages),
        });
        setModalOpen(true);
    };

    const handleDelete = (item: Stat) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormLoading(true);
        try {
            if (selectedItem) {
                await statsAPI.update({ id: selectedItem.id, ...formData });
                showToast('success', 'Statistika yeniləndi');
            } else {
                await statsAPI.create(formData);
                showToast('success', 'Statistika əlavə edildi');
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
            await statsAPI.delete(selectedItem.id);
            showToast('success', 'Statistika silindi');
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
            key: 'count' as const,
            header: 'Sayı/Göstərici',
            render: (item: Stat) => <strong>{getDisplayValue(item.count)}</strong>
        },
        {
            key: 'detail' as const,
            header: 'Məzmun',
            render: (item: Stat) => getDisplayValue(item.detail)
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Statistikalar</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd} disabled={languages.length === 0}>
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
                    emptyMessage="Statistika yoxdur"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'Statistikanı Redaktə Et' : 'Yeni Statistika'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <MultiLangInput
                        label="Göstərici (Məs: 15+, 500)"
                        name="count"
                        value={formData.count}
                        onChange={(val) => setFormData({ ...formData, count: val })}
                        languages={languages}
                        required
                    />

                    <MultiLangInput
                        label="Məzmun (Məs: İllik Təcrübə)"
                        name="detail"
                        value={formData.detail}
                        onChange={(val) => setFormData({ ...formData, detail: val })}
                        languages={languages}
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
                message="Bu statistikanı silmək istədiyinizə əminsiniz?"
                loading={formLoading}
            />
        </div>
    );
};

export default Stats;
