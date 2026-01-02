import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import './Modal.scss';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div ref={modalRef} className={`modal ${size}`} role="dialog" aria-modal="true">
                {(title || showClose) && (
                    <div className="modal-header">
                        {title && <h2 className="modal-title">{title}</h2>}
                        {showClose && (
                            <button className="modal-close" onClick={onClose} aria-label="Close">
                                <FiX />
                            </button>
                        )}
                    </div>
                )}
                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
