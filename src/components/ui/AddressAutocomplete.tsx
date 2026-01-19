import React, { useCallback, useRef, useState } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { FiMapPin, FiLoader } from 'react-icons/fi';
import './AddressAutocomplete.scss';

const libraries: ('places')[] = ['places'];

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string, mapUrl?: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Ünvan axtarın...',
    required = false,
    error,
    disabled = false,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    }, []);

    const onPlaceChanged = useCallback(() => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            if (place && place.formatted_address) {
                const address = place.formatted_address;
                setInputValue(address);

                // Generate Google Maps URL from place
                let mapUrl = '';
                if (place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                } else if (place.place_id) {
                    mapUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
                }

                onChange(address, mapUrl);
            }
        }
    }, [onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    // Sync external value changes
    React.useEffect(() => {
        setInputValue(value);
    }, [value]);

    if (loadError) {
        return (
            <div className="form-group address-autocomplete">
                {label && (
                    <label>
                        <FiMapPin className="label-icon" />
                        {label}
                        {required && <span className="required">*</span>}
                    </label>
                )}
                <div className="error-state">
                    Google Maps yüklənə bilmədi
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="form-group address-autocomplete">
                {label && (
                    <label>
                        <FiMapPin className="label-icon" />
                        {label}
                        {required && <span className="required">*</span>}
                    </label>
                )}
                <div className="loading-state">
                    <FiLoader className="spinner" />
                    Yüklənir...
                </div>
            </div>
        );
    }

    return (
        <div className={`form-group address-autocomplete ${error ? 'has-error' : ''}`}>
            {label && (
                <label>
                    <FiMapPin className="label-icon" />
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <div className="autocomplete-wrapper">
                <Autocomplete
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                        types: ['address'],
                        componentRestrictions: { country: 'az' },
                    }}
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="autocomplete-input"
                    />
                </Autocomplete>
                <FiMapPin className="input-icon" />
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default AddressAutocomplete;
