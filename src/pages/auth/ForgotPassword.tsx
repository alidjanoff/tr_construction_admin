import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/images/logo.jpeg';
import './ForgotPassword.scss';

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const { showToast } = useToast();
    const navigate = useNavigate();

    const validate = (): boolean => {
        if (!email.trim()) {
            setEmailError(t('validation.required'));
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError(t('validation.invalidEmail'));
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
            showToast('success', t('messages.saveSuccess')); // Generic success for now
            navigate('/change-password', { state: { email } });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || t('messages.saveError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-container">
                <div className="forgot-header">
                    <img src={logo} alt="TR Construction" className="forgot-logo" />
                    <h1>{t('auth.forgotPassword')}</h1>
                    <p>{t('auth.forgotPasswordInfo') || 'Email ünvanınıza OTP kodu göndəriləcək'}</p>
                </div>

                <form onSubmit={handleSubmit} className="forgot-form">
                    <CustomInput
                        type="email"
                        name="email"
                        label={t('auth.email')}
                        placeholder="admin@trconstruction.az"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={emailError}
                        icon={<FiMail />}
                        disabled={otpSent}
                        required
                    />

                    <CustomButton type="submit" fullWidth loading={loading} disabled={otpSent}>
                        {t('auth.sendOtp') || 'OTP Göndər'}
                    </CustomButton>

                    <Link to="/login" className="back-link">
                        <FiArrowLeft />
                        {t('common.back')}
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
