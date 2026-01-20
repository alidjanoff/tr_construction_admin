import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiUser, FiMail, FiPhone, FiCamera } from 'react-icons/fi';
import './Profile.scss';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('error', t('messages.uploadError'));
                return;
            }
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = t('validation.required');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('validation.required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('validation.invalidEmail');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('full_name', formData.full_name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);

            if (profileImage) {
                formDataToSend.append('profile_image', profileImage);
            }

            const response = await authAPI.updateMe(formDataToSend);
            updateUser(response.data);
            showToast('success', t('pages.profile.updateSuccess'));
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || t('messages.saveError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content profile-page">
            <div className="profile-container">
                <div className="card">
                    <div className="card-header">
                        <h3>{t('pages.profile.title')}</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="profile-image-section">
                                <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                                    {previewUrl || user?.profile_image ? (
                                        <img
                                            src={previewUrl || user?.profile_image}
                                            alt={user?.full_name}
                                            className="profile-avatar"
                                        />
                                    ) : (
                                        <div className="profile-avatar-placeholder">
                                            <FiUser />
                                        </div>
                                    )}
                                    <div className="avatar-overlay">
                                        <FiCamera />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <p className="avatar-hint">{t('pages.hero.selectImage')}</p>
                            </div>

                            <div className="form-row">
                                <CustomInput
                                    type="text"
                                    name="full_name"
                                    label={t('pages.users.fullName')}
                                    placeholder={t('pages.users.fullName')}
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    error={errors.full_name}
                                    icon={<FiUser />}
                                    required
                                />

                                <CustomInput
                                    type="email"
                                    name="email"
                                    label={t('auth.email')}
                                    placeholder={t('auth.email')}
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    icon={<FiMail />}
                                    required
                                />
                            </div>

                            <CustomInput
                                type="tel"
                                name="phone"
                                label={t('pages.applications.phone')}
                                placeholder="+994 XX XXX XX XX"
                                value={formData.phone}
                                onChange={handleChange}
                                icon={<FiPhone />}
                            />

                            <div className="role-display">
                                <span className="role-label">{t('pages.users.role')}:</span>
                                <span className={`role-value ${user?.role}`}>
                                    {user?.role === 'superAdmin' ? t('pages.users.roles.superAdmin') : t('pages.users.roles.admin')}
                                </span>
                            </div>

                            <div className="button-group right">
                                <CustomButton type="submit" loading={loading}>
                                    {t('common.save')}
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
