import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { workflowAPI } from '../../services/api';
import { useLanguages } from '../../contexts/LanguageContext';
import { useDisplayText } from '../../hooks/useDisplayText';
import type { Workflow as WorkflowType, TranslatedString } from '../../types';
import { createEmptyTranslation } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import TranslatableInput from '../../components/ui/TranslatableInput';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { FiPlus } from 'react-icons/fi';
import './CrudPage.scss';

interface WorkflowFormData {
    title: TranslatedString;
    details: TranslatedString;
}

const Workflow: React.FC = () => {
    const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WorkflowType | null>(null);
    const [formData, setFormData] = useState<WorkflowFormData>({ title: {}, details: {} });
    const [formLoading, setFormLoading] = useState(false);

    const { showToast } = useToast();
    const { languages } = useLanguages();
    const { getDisplayText } = useDisplayText();

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

    const fetchDataCallback = React.useCallback(fetchData, [showToast]);

    useEffect(() => {
        fetchDataCallback();
    }, [fetchDataCallback]);

    const handleAdd = () => {
        setSelectedItem(null);
        setFormData({
            title: createEmptyTranslation(languages),
            details: createEmptyTranslation(languages),
        });
        setModalOpen(true);
    };

    const handleEdit = (item: WorkflowType) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || {},
            details: item.details || {},
        });
        setModalOpen(true);
    };

    const handleDelete = (item: WorkflowType) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasTitle = Object.values(formData.title).some(v => v && v.trim());
        const hasDetails = Object.values(formData.details).some(v => v && v.trim());

        if (!hasTitle || !hasDetails) {
            showToast('error', 'Ən azı bir dildə başlıq və detalları daxil edin');
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

    const columns = [
        {
            key: 'title' as const,
            header: 'Başlıq',
            render: (item: WorkflowType) => getDisplayText(item.title, '-')
        },
        {
            key: 'details' as const,
            header: 'Detallar',
            render: (item: WorkflowType) => {
                const text = getDisplayText(item.details, '');
                return <span className="truncate">{text.slice(0, 60)}{text.length > 60 ? '...' : ''}</span>;
            }
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
                title={selectedItem ? 'İş Axınını Redaktə Et' : 'Yeni İş Axını'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <TranslatableInput
                        name="title"
                        label="Başlıq"
                        value={formData.title}
                        onChange={(value) => setFormData({ ...formData, title: value })}
                        placeholder="məs: Planlama, Dizayn, Tikinti"
                        required
                    />

                    <TranslatableInput
                        name="details"
                        label="Detallar"
                        value={formData.details}
                        onChange={(value) => setFormData({ ...formData, details: value })}
                        type="textarea"
                        placeholder="İş axını haqqında ətraflı məlumat"
                        rows={4}
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
                message={`"${getDisplayText(selectedItem?.title, '')}" iş axınını silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Workflow;
