import React from 'react';
import Modal from './Modal';
import CustomButton from './CustomButton';
import './ConfirmDialog.scss';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Təsdiq',
    message,
    confirmText = 'Bəli',
    cancelText = 'Xeyr',
    variant = 'danger',
    loading = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
            <div className="confirm-dialog">
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <CustomButton variant="secondary" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </CustomButton>
                    <CustomButton
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </CustomButton>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
