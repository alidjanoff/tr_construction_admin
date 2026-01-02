import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './ui/Loader';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireSuperAdmin = false,
}) => {
    const { isAuthenticated, isLoading, isSuperAdmin } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Loader fullPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
        return (
            <div className="page-content">
                <div className="card">
                    <div className="empty-state">
                        <h3>Giriş İcazəsi Yoxdur</h3>
                        <p>Bu səhifəyə yalnız Super Admin istifadəçiləri daxil ola bilər.</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
