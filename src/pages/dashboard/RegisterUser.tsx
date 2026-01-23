import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import './CrudPage.scss';

const RegisterUser: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'admin' as 'admin' | 'superAdmin',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
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
            newErrors.email = t('validation.required');
        }

        if (!formData.password) {
            newErrors.password = t('validation.required');
        } else if (formData.password.length < 6) {
            newErrors.password = t('validation.required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await authAPI.register(formData);
            showToast('success', t('messages.saveSuccess'));
            navigate('/users');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || t('messages.saveError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <CustomButton variant="ghost" icon={<FiArrowLeft />} onClick={() => navigate('/users')}>
                    {t('common.back')}
                </CustomButton>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="card-header">
                    <h3>{t('pages.users.newUser')}</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
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
                            label={t('pages.users.email')}
                            placeholder={t('pages.users.email')}
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            icon={<FiMail />}
                            required
                        />

                        <CustomInput
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            label={t('pages.profile.newPassword')}
                            placeholder={t('pages.profile.newPassword')}
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            icon={<FiLock />}
                            rightIcon={showPassword ? <FiEyeOff /> : <FiEye />}
                            onRightIconClick={() => setShowPassword(!showPassword)}
                            required
                        />

                        <CustomInput
                            type="tel"
                            name="phone"
                            label={t('pages.users.phone')}
                            placeholder="+994 XX XXX XX XX"
                            value={formData.phone}
                            onChange={handleChange}
                            icon={<FiPhone />}
                        />

                        <div className="form-group">
                            <label>{t('pages.users.role')}</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="custom-select"
                            >
                                <option value="admin">Admin</option>
                                <option value="superAdmin">Super Admin</option>
                            </select>
                        </div>

                        <div className="button-group right">
                            <CustomButton variant="secondary" onClick={() => navigate('/users')}>
                                {t('common.cancel')}
                            </CustomButton>
                            <CustomButton type="submit" loading={loading}>
                                {t('pages.users.newUser')}
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;
