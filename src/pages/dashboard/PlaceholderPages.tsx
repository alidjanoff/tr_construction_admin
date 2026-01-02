// Placeholder pages for remaining CRUD functionality
// These follow the same pattern as Services.tsx

import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

interface PlaceholderPageProps {
    title: string;
    description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => (
    <div className="page-content">
        <h1 className="page-title">{title}</h1>
        <div className="card">
            <div className="empty-state">
                <FiAlertCircle />
                <h3>Səhifə işlənir</h3>
                <p>{description || 'Bu bölmə tezliklə aktiv olacaq.'}</p>
            </div>
        </div>
    </div>
);

// Export individual placeholder components
export const Hero = () => <PlaceholderPage title="Hero Bölməsi" description="Ana səhifə slider idarəçiliyi" />;
export const About = () => <PlaceholderPage title="Haqqımızda" description="Şirkət haqqında məlumat idarəçiliyi" />;
export const Stats = () => <PlaceholderPage title="Statistika" description="Statistik göstəricilər idarəçiliyi" />;
export const Projects = () => <PlaceholderPage title="Layihələr" description="Layihələr qaleryası idarəçiliyi" />;
export const Workflow = () => <PlaceholderPage title="İş Axını" description="İş prosesləri idarəçiliyi" />;
export const Partners = () => <PlaceholderPage title="Partnyorlar" description="Partnyor şirkətləri idarəçiliyi" />;
export const Testimonials = () => <PlaceholderPage title="Müştəri Rəyləri" description="Müştəri rəyləri idarəçiliyi" />;
export const ContactInfo = () => <PlaceholderPage title="Əlaqə Məlumatları" description="Əlaqə məlumatları idarəçiliyi" />;
export const Socials = () => <PlaceholderPage title="Sosial Şəbəkələr" description="Sosial media hesabları idarəçiliyi" />;
export const MapUrl = () => <PlaceholderPage title="Xəritə Koordinatları" description="Google Maps koordinatları idarəçiliyi" />;
export const Languages = () => <PlaceholderPage title="Dillər" description="Dil seçimləri idarəçiliyi" />;
