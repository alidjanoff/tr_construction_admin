import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import './CrudPage.scss';

const RegisterUser: React.FC = () => {
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
            newErrors.full_name = 'Ad soyadı daxil edin';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email daxil edin';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Düzgün email formatı daxil edin';
        }

        if (!formData.password) {
            newErrors.password = 'Şifrə daxil edin';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Şifrə minimum 6 simvol olmalıdır';
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
            showToast('success', 'İstifadəçi uğurla yaradıldı');
            navigate('/users');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || 'İstifadəçi yaradıla bilmədi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <CustomButton variant="ghost" icon={<FiArrowLeft />} onClick={() => navigate('/users')}>
                    Geri
                </CustomButton>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="card-header">
                    <h3>Yeni İstifadəçi Yarat</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <CustomInput
                            type="text"
                            name="full_name"
                            label="Ad Soyad"
                            placeholder="Ad Soyad daxil edin"
                            value={formData.full_name}
                            onChange={handleChange}
                            error={errors.full_name}
                            icon={<FiUser />}
                            required
                        />

                        <CustomInput
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="Email daxil edin"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            icon={<FiMail />}
                            required
                        />

                        <CustomInput
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            label="Şifrə"
                            placeholder="Şifrə daxil edin"
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
                            label="Telefon"
                            placeholder="+994 XX XXX XX XX"
                            value={formData.phone}
                            onChange={handleChange}
                            icon={<FiPhone />}
                        />

                        <div className="form-group">
                            <label>Rol</label>
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
                                Ləğv et
                            </CustomButton>
                            <CustomButton type="submit" loading={loading}>
                                İstifadəçi Yarat
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;
