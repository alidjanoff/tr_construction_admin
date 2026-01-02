import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiLock, FiKey, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../../assets/images/logo.jpeg';
import './ChangePassword.scss';

const ChangePassword: React.FC = () => {
    const location = useLocation();
    const initialEmail = (location.state as { email?: string })?.email || '';

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { showToast } = useToast();
    const navigate = useNavigate();

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!email.trim()) {
            newErrors.email = 'Email daxil edin';
        }

        if (!otp.trim()) {
            newErrors.otp = 'OTP kodu daxil edin';
        } else if (otp.length !== 6) {
            newErrors.otp = 'OTP 6 rəqəm olmalıdır';
        }

        if (!newPassword) {
            newErrors.newPassword = 'Yeni şifrə daxil edin';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Şifrə minimum 6 simvol olmalıdır';
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Şifrələr uyğun gəlmir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await authAPI.changePassword(email, otp, newPassword);
            showToast('success', 'Şifrəniz uğurla dəyişdirildi');
            navigate('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || 'Şifrə dəyişdirilə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-page">
            <div className="change-container">
                <div className="change-header">
                    <img src={logo} alt="TR Construction" className="change-logo" />
                    <h1>Şifrəni Dəyiş</h1>
                    <p>OTP kodu və yeni şifrənizi daxil edin</p>
                </div>

                <form onSubmit={handleSubmit} className="change-form">
                    <CustomInput
                        type="email"
                        name="email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        disabled={!!initialEmail}
                        required
                    />

                    <CustomInput
                        type="text"
                        name="otp"
                        label="OTP Kodu"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        error={errors.otp}
                        icon={<FiKey />}
                        required
                    />

                    <CustomInput
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        label="Yeni Şifrə"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={errors.newPassword}
                        icon={<FiLock />}
                        rightIcon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onRightIconClick={() => setShowPassword(!showPassword)}
                        required
                    />

                    <CustomInput
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        label="Şifrəni Təsdiqlə"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                        icon={<FiLock />}
                        required
                    />

                    <CustomButton type="submit" fullWidth loading={loading}>
                        Şifrəni Dəyiş
                    </CustomButton>

                    <Link to="/login" className="back-link">
                        <FiArrowLeft />
                        Girişə qayıt
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
