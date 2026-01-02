import React from 'react';
import './Loader.scss';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    fullPage?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', fullPage = false }) => {
    if (fullPage) {
        return (
            <div className="loader-fullpage">
                <div className={`loader ${size}`}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`loader ${size}`}>
            <div className="spinner"></div>
        </div>
    );
};

export default Loader;
