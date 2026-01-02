import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import './Toast.scss';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <FiCheckCircle />;
            case 'error':
                return <FiAlertCircle />;
            case 'warning':
                return <FiAlertCircle />;
            case 'info':
                return <FiInfo />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast ${toast.type}`}>
                        <span className="toast-icon">{getIcon(toast.type)}</span>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <FiX />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
