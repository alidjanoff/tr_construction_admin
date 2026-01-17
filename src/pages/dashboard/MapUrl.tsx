import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { mapUrlAPI } from '../../services/api';
import type { MapUrl as MapUrlType } from '../../types';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import { FiSave, FiMapPin } from 'react-icons/fi';
import './CrudPage.scss';

const MapUrl: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState<MapUrlType>({
        long: '',
        lat: '',
    });

    const { showToast } = useToast();

    const fetchData = async () => {
        try {
            const response = await mapUrlAPI.get();
            if (response.data) {
                setFormData({
                    long: response.data.long || '',
                    lat: response.data.lat || '',
                });
            }
        } catch {
            // No data yet
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.long.trim() || !formData.lat.trim()) {
            showToast('error', 'Koordinatları daxil edin');
            return;
        }

        setFormLoading(true);
        try {
            await mapUrlAPI.update({
                long: formData.long,
                lat: formData.lat,
            });
            showToast('success', 'Koordinatlar yadda saxlanıldı');
        } catch {
            showToast('error', 'Əməliyyat uğursuz oldu');
        } finally {
            setFormLoading(false);
        }
    };

    const getMapPreviewUrl = () => {
        if (formData.lat && formData.long) {
            return `https://www.google.com/maps?q=${formData.lat},${formData.long}&z=15&output=embed`;
        }
        return '';
    };

    if (loading) {
        return (
            <div className="page-content">
                <div className="loading-spinner">Yüklənir...</div>
            </div>
        );
    }

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Xəritə Koordinatları</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <CustomInput
                            name="lat"
                            label="Enlik (Latitude)"
                            placeholder="Məsələn: 40.4093"
                            value={formData.lat}
                            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                            required
                        />

                        <CustomInput
                            name="long"
                            label="Uzunluq (Longitude)"
                            placeholder="Məsələn: 49.8671"
                            value={formData.long}
                            onChange={(e) => setFormData({ ...formData, long: e.target.value })}
                            required
                        />
                    </div>

                    {/* Map Preview */}
                    {formData.lat && formData.long && (
                        <div className="map-preview">
                            <label><FiMapPin /> Xəritə Önizləməsi</label>
                            <iframe
                                src={getMapPreviewUrl()}
                                width="100%"
                                height="300"
                                style={{ border: 0, borderRadius: '0.5rem' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Map Preview"
                            />
                        </div>
                    )}

                    <div className="button-group right">
                        <CustomButton type="submit" loading={formLoading} icon={<FiSave />}>
                            Yadda Saxla
                        </CustomButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MapUrl;
