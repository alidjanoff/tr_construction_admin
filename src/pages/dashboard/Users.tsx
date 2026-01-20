import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import type { User } from '../../types';
import DataTable from '../../components/ui/DataTable';
import CustomButton from '../../components/ui/CustomButton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { FiPlus, FiUserCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './CrudPage.scss';

const Users: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [newRole, setNewRole] = useState<'admin' | 'superAdmin'>('admin');

    const { showToast } = useToast();
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getUsers();
            setUsers(response.data || []);
        } catch {
            showToast('error', t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersCallback = React.useCallback(fetchUsers, [showToast, t]);

    useEffect(() => {
        fetchUsersCallback();
    }, [fetchUsersCallback]);

    const handleAddUser = () => {
        navigate('/users/new');
    };

    const handleChangeRole = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role === 'admin' ? 'superAdmin' : 'admin');
        setRoleModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleConfirmRoleChange = async () => {
        if (!selectedUser) return;

        setFormLoading(true);
        try {
            await authAPI.changeUserRole(selectedUser.id, newRole);
            showToast('success', t('pages.users.roleChanged'));
            setRoleModalOpen(false);
            fetchUsers();
        } catch {
            showToast('error', t('messages.saveError'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        setFormLoading(true);
        try {
            await authAPI.deleteUser(selectedUser.id);
            showToast('success', t('messages.deleteSuccess'));
            setDeleteDialogOpen(false);
            fetchUsers();
        } catch {
            showToast('error', t('messages.deleteError'));
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'profile_image' as const,
            header: '',
            width: '60px',
            render: (user: User) => (
                user.profile_image ? (
                    <img src={user.profile_image} alt="" className="avatar sm" />
                ) : (
                    <div className="avatar sm" style={{ background: '#1B5E3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                        {user.full_name.charAt(0)}
                    </div>
                )
            ),
        },
        { key: 'full_name' as const, header: t('pages.users.fullName') },
        { key: 'email' as const, header: t('pages.users.email') },
        { key: 'phone' as const, header: t('pages.users.phone') },
        {
            key: 'role' as const,
            header: t('pages.users.role'),
            render: (user: User) => (
                <span className={`badge ${user.role === 'superAdmin' ? 'primary' : 'info'}`}>
                    {user.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                </span>
            ),
        },
    ];

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">{t('sidebar.users')}</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAddUser}>
                    {t('pages.users.newUser')}
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    onEdit={handleChangeRole}
                    onDelete={handleDelete}
                    emptyMessage={t('common.noData')}
                />
            </div>

            <Modal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title={t('pages.users.changeRole')}
                size="sm"
            >
                <div style={{ marginBottom: '16px' }}>
                    <p><strong>{selectedUser?.full_name}</strong> {t('pages.users.changeRoleConfirm')}</p>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('pages.users.currentRole')}:</span>
                            <span className={`badge ${selectedUser?.role === 'superAdmin' ? 'primary' : 'info'}`}>
                                {selectedUser?.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('pages.users.newRole')}:</span>
                            <span className={`badge ${newRole === 'superAdmin' ? 'primary' : 'info'}`}>
                                {newRole === 'superAdmin' ? 'Super Admin' : 'Admin'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="button-group right">
                    <CustomButton variant="secondary" onClick={() => setRoleModalOpen(false)}>
                        {t('common.cancel')}
                    </CustomButton>
                    <CustomButton onClick={handleConfirmRoleChange} loading={formLoading} icon={<FiUserCheck />}>
                        {t('common.confirm')}
                    </CustomButton>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={t('pages.users.deleteConfirm')}
                loading={formLoading}
            />
        </div>
    );
};

export default Users;
