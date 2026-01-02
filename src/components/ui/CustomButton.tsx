import React from 'react';
import './CustomButton.scss';

interface CustomButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    onClick,
    className = '',
}) => {
    return (
        <button
            type={type}
            className={`custom-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? (
                <span className="loader"></span>
            ) : (
                <>
                    {icon && <span className="icon">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default CustomButton;
