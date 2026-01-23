import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiMail, FiArrowLeft, FiKey, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../../assets/images/logo.jpeg';
import './ForgotPassword.scss';

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);

    // Form data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const validateEmail = (): boolean => {
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

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setLoading(true);
        try {
            await authAPI.sendOtp(email);
            showToast('success', t('auth.otpSent') || 'Təhlükəsizlik kodu e-poçt ünvanınıza göndərildi');
            setStep(2);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || t('messages.saveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim() || otp.length !== 6) {
            setOtpError(t('validation.minLength', { min: 6 }));
            return;
        }

        setLoading(true);
        try {
            await authAPI.verifyOtp(email, otp);
            showToast('success', t('auth.otpVerified') || 'Kod təsdiqləndi');
            setStep(3);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || t('auth.invalidOtp') || 'Yanlış kod');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (newPassword.length < 6) {
            setPasswordError(t('validation.minLength', { min: 6 }));
            return;
        }
        if (newPassword !== confirmPassword) {
            setConfirmPasswordError(t('validation.passwordsMustMatch') || 'Şifrələr uyğun gəlmir');
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword(email, otp, newPassword);
            showToast('success', t('pages.profile.passwordSuccess'));
            navigate('/login');
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
                    {step === 1 && <p>{t('auth.forgotPasswordInfo') || 'Email ünvanınıza təhlükəsizlik kodu göndəriləcək'}</p>}
                    {step === 2 && <p>{t('auth.enterOtpInfo') || 'Elektron poçtunuza gələn 6 rəqəmli kodu daxil edin'}</p>}
                    {step === 3 && <p>{t('auth.setNewPasswordInfo') || 'Yeni şifrənizi təyin edin'}</p>}
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="forgot-form">
                        <CustomInput
                            type="email"
                            name="email"
                            label={t('auth.email')}
                            placeholder="admin@trconstruction.az"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                            error={emailError}
                            icon={<FiMail />}
                            required
                        />
                        <CustomButton type="submit" fullWidth loading={loading}>
                            {t('auth.sendOtp') || 'Kod Göndər'}
                        </CustomButton>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="forgot-form">
                        <CustomInput
                            type="text"
                            name="otp"
                            label={t('auth.otpCode') || 'OTP Kodu'}
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                            error={otpError}
                            icon={<FiKey />}
                            required
                        />
                        <CustomButton type="submit" fullWidth loading={loading}>
                            {t('auth.verifyButton') || 'Kodu Təsdiqlə'}
                        </CustomButton>
                        <button type="button" className="resend-button" onClick={() => setStep(1)} disabled={loading}>
                            {t('auth.changeEmail') || 'E-poçtu dəyiş'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="forgot-form">
                        <CustomInput
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            label={t('pages.profile.newPassword')}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                            error={passwordError}
                            icon={<FiLock />}
                            rightIcon={showPassword ? <FiEyeOff /> : <FiEye />}
                            onRightIconClick={() => setShowPassword(!showPassword)}
                            required
                        />
                        <CustomInput
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            label={t('pages.profile.confirmPassword')}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); }}
                            error={confirmPasswordError}
                            icon={<FiLock />}
                            required
                        />
                        <CustomButton type="submit" fullWidth loading={loading}>
                            {t('auth.resetPasswordButton') || 'Şifrəni Yenilə'}
                        </CustomButton>
                    </form>
                )}

                <Link to="/login" className="back-link">
                    <FiArrowLeft />
                    {t('common.back')}
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
