import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../../assets/images/logo.png';
import './Login.scss';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    // Check for session expired message
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('session_expired') === 'true') {
            showToast('warning', t('messages.loadError')); // Using loadError or similar
        }
    }, [location.search, showToast, t]);

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = t('validation.required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('validation.invalidEmail');
        }

        if (!password) {
            newErrors.password = t('validation.required');
        } else if (password.length < 6) {
            newErrors.password = t('validation.minLength', { min: 6 });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await login(email, password);
            showToast('success', t('messages.saveSuccess'));
            navigate(from, { replace: true });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast('error', err.response?.data?.message || t('auth.invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <img src={logo} alt="TR Construction" className="login-logo" />
                    <h1>TR Construction</h1>
                    <p>Admin Panel</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <CustomInput
                        type="email"
                        name="email"
                        label={t('auth.email')}
                        placeholder="admin@trconstruction.az"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        icon={<FiMail />}
                        required
                    />

                    <CustomInput
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        label={t('auth.password')}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        icon={<FiLock />}
                        rightIcon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onRightIconClick={() => setShowPassword(!showPassword)}
                        required
                    />

                    <Link to="/forgot-password" className="forgot-link">
                        {t('auth.forgotPassword')}
                    </Link>

                    <CustomButton type="submit" fullWidth loading={loading}>
                        {t('auth.loginButton')}
                    </CustomButton>
                </form>
            </div>

            <div className="login-footer">
                <p>© 2026 TR Construction. {t('common.allRightsReserved') || 'Bütün hüquqlar qorunur.'}</p>
            </div>
        </div>
    );
};

export default Login;
