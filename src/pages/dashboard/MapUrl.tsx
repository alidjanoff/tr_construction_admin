import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { mapUrlAPI } from '../../services/api';
import type { MapUrl as MapUrlType } from '../../types';
import CustomButton from '../../components/ui/CustomButton';
import CustomInput from '../../components/ui/CustomInput';
import Loader from '../../components/ui/Loader';
import { FiMapPin, FiSave } from 'react-icons/fi';
import './CrudPage.scss';

const MapUrl: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<MapUrlType>({ long: '', lat: '' });

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
        } catch (error) {
            showToast('error', 'Xəritə koordinatları yüklənə bilmədi');
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
            showToast('error', 'Bütün koordinatları daxil edin');
            return;
        }

        setSaving(true);
        try {
            await mapUrlAPI.update({
                long: formData.long,
                lat: formData.lat,
            });
            showToast('success', 'Xəritə koordinatları yeniləndi');
        } catch (error) {
            showToast('error', 'Yeniləmə uğursuz oldu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content">
                <Loader size="lg" />
            </div>
        );
    }

    const mapPreviewUrl = formData.lat && formData.long
        ? `https://www.google.com/maps?q=${formData.lat},${formData.long}&z=15&output=embed`
        : null;

    return (
        <div className="page-content crud-page">
            <div className="page-header">
                <h1 className="page-title">Xəritə Koordinatları</h1>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="info-banner">
                        <FiMapPin />
                        <p>
                            Burada şirkətin ofis yerləşməsinin Google Maps koordinatlarını daxil edin.
                            Bu koordinatlar saytdakı xəritədə göstəriləcək.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <CustomInput
                                name="lat"
                                label="Latitude (Enlıq)"
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                placeholder="məs: 40.4093"
                                required
                            />

                            <CustomInput
                                name="long"
                                label="Longitude (Boylam)"
                                value={formData.long}
                                onChange={(e) => setFormData({ ...formData, long: e.target.value })}
                                placeholder="məs: 49.8671"
                                required
                            />
                        </div>

                        {mapPreviewUrl && (
                            <div className="map-preview">
                                <label>Xəritə Önizləmə</label>
                                <iframe
                                    src={mapPreviewUrl}
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: '8px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Map Preview"
                                />
                            </div>
                        )}

                        <div className="button-group right" style={{ marginTop: '1.5rem' }}>
                            <CustomButton type="submit" icon={<FiSave />} loading={saving}>
                                Yadda saxla
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MapUrl;
