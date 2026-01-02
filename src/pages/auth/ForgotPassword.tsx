import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/images/logo.jpeg';
import './ForgotPassword.scss';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const { showToast } = useToast();
    const navigate = useNavigate();

    const validate = (): boolean => {
        if (!email.trim()) {
            setEmailError('Email daxil edin');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Düzgün email formatı daxil edin');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await authAPI.sendOtp(email);
            setOtpSent(true);
            showToast('success', 'OTP kodu email ünvanınıza göndərildi');
            navigate('/change-password', { state: { email } });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || 'OTP göndərilə bilmədi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-container">
                <div className="forgot-header">
                    <img src={logo} alt="TR Construction" className="forgot-logo" />
                    <h1>Şifrəni Bərpa Et</h1>
                    <p>Email ünvanınıza OTP kodu göndəriləcək</p>
                </div>

                <form onSubmit={handleSubmit} className="forgot-form">
                    <CustomInput
                        type="email"
                        name="email"
                        label="Email"
                        placeholder="admin@trconstruction.az"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={emailError}
                        icon={<FiMail />}
                        disabled={otpSent}
                        required
                    />

                    <CustomButton type="submit" fullWidth loading={loading} disabled={otpSent}>
                        OTP Göndər
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

export default ForgotPassword;
