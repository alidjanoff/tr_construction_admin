import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { workflowAPI, languagesAPI } from '../../services/api';
import type { Workflow as WorkflowType, Language, MultiLang } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MultiLangInput from '../../components/ui/MultiLangInput';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

const emptyMultiLang = (): MultiLang => ({ az: '', en: '' });

const Workflow: React.FC = () => {
    const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
    const [languages, setLanguages] = useState<string[]>(['az', 'en']);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WorkflowType | null>(null);
    const [formData, setFormData] = useState({
        title: emptyMultiLang(),
        details: emptyMultiLang(),
    });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();

    const fetchLanguages = async () => {
        try {
            const response = await languagesAPI.getAll();
            const langs = response.data?.map((l: Language) => l.lang) || ['az', 'en'];
            setLanguages(langs);
        } catch {
            // Use default
        }
    };

    const fetchData = async () => {
        try {
            const response = await workflowAPI.getAll();
            setWorkflows(response.data || []);
        } catch {
            showToast('error', 'İş axını yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
        fetchData();
    }, []);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({ title: emptyMultiLang(), details: emptyMultiLang() });
        setModalOpen(true);
    };

    const handleEdit = (item: WorkflowType) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || emptyMultiLang(),
            details: item.details || emptyMultiLang(),
        });
        setModalOpen(true);
    };

    const handleDelete = (item: WorkflowType) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.az && !formData.title.en) {
            showToast('error', 'Başlıq daxil edin');
            return;
        }

        setFormLoading(true);
        try {
            if (selectedItem) {
                await workflowAPI.update({
                    id: selectedItem.id,
                    title: formData.title,
                    details: formData.details,
                });
                showToast('success', 'İş axını yeniləndi');
            } else {
                await workflowAPI.create({
                    title: formData.title,
                    details: formData.details,
                });
                showToast('success', 'İş axını əlavə edildi');
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
            await workflowAPI.delete(selectedItem.id);
            showToast('success', 'İş axını silindi');
            setDeleteDialogOpen(false);
            fetchData();
        } catch {
            showToast('error', 'Silmə uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const getDisplayValue = (multiLang: MultiLang) => {
        return multiLang?.az || multiLang?.en || '-';
    };

    const columns = [
        {
            key: 'title' as const,
            header: 'Başlıq',
            render: (item: WorkflowType) => <strong>{getDisplayValue(item.title)}</strong>
        },
        {
            key: 'details' as const,
            header: 'Təfərrüat',
            render: (item: WorkflowType) => <span className="truncate">{getDisplayValue(item.details).slice(0, 60)}...</span>
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">İş Axını</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAdd}>
                    Əlavə et
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={workflows}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="İş axını tapılmadı"
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedItem ? 'İş Axını Redaktə Et' : 'Yeni İş Axını'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <MultiLangInput
                        label="Başlıq"
                        name="title"
                        value={formData.title}
                        onChange={(val) => setFormData({ ...formData, title: val })}
                        placeholder="Addım başlığı"
                        required
                        languages={languages}
                    />

                    <MultiLangInput
                        label="Təfərrüat"
                        name="details"
                        value={formData.details}
                        onChange={(val) => setFormData({ ...formData, details: val })}
                        placeholder="Addım haqqında ətraflı məlumat"
                        type="textarea"
                        languages={languages}
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
                message={`Bu iş axını addımını silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Workflow;
