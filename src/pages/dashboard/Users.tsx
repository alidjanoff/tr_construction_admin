import React, { useState, useEffect } from 'react';
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
        } catch (error) {
            showToast('error', 'İstifadəçilər yüklənə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
            showToast('success', 'Rol uğurla dəyişdirildi');
            setRoleModalOpen(false);
            fetchUsers();
        } catch (error) {
            showToast('error', 'Rol dəyişdirilə bilmədi');
        } finally {
            setFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        setFormLoading(true);
        try {
            await authAPI.deleteUser(selectedUser.id);
            showToast('success', 'İstifadəçi silindi');
            setDeleteDialogOpen(false);
            fetchUsers();
        } catch (error) {
            showToast('error', 'İstifadəçi silinə bilmədi');
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
        { key: 'full_name' as const, header: 'Ad Soyad' },
        { key: 'email' as const, header: 'Email' },
        { key: 'phone' as const, header: 'Telefon' },
        {
            key: 'role' as const,
            header: 'Rol',
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
                <h1 className="page-title">İstifadəçilər</h1>
                <CustomButton icon={<FiPlus />} onClick={handleAddUser}>
                    Yeni İstifadəçi
                </CustomButton>
            </div>

            <div className="card">
                <DataTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    onEdit={handleChangeRole}
                    onDelete={handleDelete}
                    emptyMessage="İstifadəçi tapılmadı"
                />
            </div>

            <Modal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title="Rol Dəyişdir"
                size="sm"
            >
                <div style={{ marginBottom: '16px' }}>
                    <p><strong>{selectedUser?.full_name}</strong> istifadəçisinin rolunu dəyişmək istəyirsiniz?</p>
                    <p style={{ marginTop: '8px', color: '#666' }}>
                        Mövcud rol: <span className={`badge ${selectedUser?.role === 'superAdmin' ? 'primary' : 'info'}`}>
                            {selectedUser?.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                        </span>
                    </p>
                    <p style={{ marginTop: '8px', color: '#666' }}>
                        Yeni rol: <span className={`badge ${newRole === 'superAdmin' ? 'primary' : 'info'}`}>
                            {newRole === 'superAdmin' ? 'Super Admin' : 'Admin'}
                        </span>
                    </p>
                </div>
                <div className="button-group right">
                    <CustomButton variant="secondary" onClick={() => setRoleModalOpen(false)}>
                        Ləğv et
                    </CustomButton>
                    <CustomButton onClick={handleConfirmRoleChange} loading={formLoading} icon={<FiUserCheck />}>
                        Təsdiqlə
                    </CustomButton>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={`"${selectedUser?.full_name}" istifadəçisini silmək istədiyinizə əminsiniz?`}
                loading={formLoading}
            />
        </div>
    );
};

export default Users;
