import React, { forwardRef } from 'react';
import './CustomInput.scss';

interface CustomInputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    name: string;
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
    className?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
    type = 'text',
    name,
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
    icon,
    rightIcon,
    onRightIconClick,
    className = '',
}, ref) => {
    return (
        <div className={`custom-input-wrapper ${className}`}>
            {label && (
                <label htmlFor={name}>
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <div className={`input-container ${error ? 'has-error' : ''} ${icon ? 'has-icon' : ''}`}>
                {icon && <span className="left-icon">{icon}</span>}
                <input
                    ref={ref}
                    type={type}
                    id={name}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    required={required}
                    className={error ? 'error' : ''}
                />
                {rightIcon && (
                    <button
                        type="button"
                        className="right-icon"
                        onClick={onRightIconClick}
                        tabIndex={-1}
                    >
                        {rightIcon}
                    </button>
                )}
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;
