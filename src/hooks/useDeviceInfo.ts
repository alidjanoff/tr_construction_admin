import { useState, useEffect } from 'react';

interface DeviceInfo {
    // Platform & OS
    platform: string;
    os: string;
    osVersion: string;

    // Browser
    browser: string;
    browserVersion: string;

    // Device
    deviceType: 'desktop' | 'mobile' | 'tablet';
    deviceModel: string;
    deviceVendor: string;

    // Screen
    screenWidth: number;
    screenHeight: number;
    screenColorDepth: number;
    pixelRatio: number;

    // Hardware (limited on web)
    hardwareConcurrency: number; // CPU cores
    deviceMemory: number; // RAM in GB (Chrome only)

    // Network
    connectionType: string;
    effectiveType: string;
    downlink: number;

    // Location (requires permission)
    latitude: number | null;
    longitude: number | null;
    locationError: string | null;

    // Other
    language: string;
    languages: string[];
    timezone: string;
    cookiesEnabled: boolean;
    doNotTrack: boolean;
    touchSupport: boolean;

    // IP (requires external API)
    ipAddress: string;
    city: string;
    country: string;
}

const getOSInfo = (): { os: string; osVersion: string } => {
    const userAgent = navigator.userAgent;
    let os = 'Unknown';
    let osVersion = '';

    if (/Windows NT 10.0/.test(userAgent)) {
        os = 'Windows';
        osVersion = '10/11';
    } else if (/Windows NT 6.3/.test(userAgent)) {
        os = 'Windows';
        osVersion = '8.1';
    } else if (/Windows NT 6.2/.test(userAgent)) {
        os = 'Windows';
        osVersion = '8';
    } else if (/Windows NT 6.1/.test(userAgent)) {
        os = 'Windows';
        osVersion = '7';
    } else if (/Mac OS X/.test(userAgent)) {
        os = 'macOS';
        const match = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
        osVersion = match ? match[1].replace(/_/g, '.') : '';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
        const match = userAgent.match(/Android (\d+\.?\d*\.?\d*)/);
        osVersion = match ? match[1] : '';
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        os = 'iOS';
        const match = userAgent.match(/OS (\d+_\d+_?\d*)/);
        osVersion = match ? match[1].replace(/_/g, '.') : '';
    } else if (/Linux/.test(userAgent)) {
        os = 'Linux';
        osVersion = '';
    }

    return { os, osVersion };
};

const getBrowserInfo = (): { browser: string; browserVersion: string } => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let browserVersion = '';

    if (/Edg\//.test(userAgent)) {
        browser = 'Microsoft Edge';
        const match = userAgent.match(/Edg\/(\d+\.?\d*\.?\d*\.?\d*)/);
        browserVersion = match ? match[1] : '';
    } else if (/Chrome\//.test(userAgent) && !/Chromium/.test(userAgent)) {
        browser = 'Google Chrome';
        const match = userAgent.match(/Chrome\/(\d+\.?\d*\.?\d*\.?\d*)/);
        browserVersion = match ? match[1] : '';
    } else if (/Safari\//.test(userAgent) && !/Chrome/.test(userAgent)) {
        browser = 'Safari';
        const match = userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/);
        browserVersion = match ? match[1] : '';
    } else if (/Firefox\//.test(userAgent)) {
        browser = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+\.?\d*)/);
        browserVersion = match ? match[1] : '';
    } else if (/Opera|OPR/.test(userAgent)) {
        browser = 'Opera';
        const match = userAgent.match(/(?:Opera|OPR)\/(\d+\.?\d*)/);
        browserVersion = match ? match[1] : '';
    }

    return { browser, browserVersion };
};

const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const userAgent = navigator.userAgent;

    if (/Tablet|iPad/i.test(userAgent)) {
        return 'tablet';
    }
    if (/Mobile|iPhone|Android.*Mobile/i.test(userAgent)) {
        return 'mobile';
    }
    return 'desktop';
};

const getDeviceInfo = (): { model: string; vendor: string } => {
    const userAgent = navigator.userAgent;
    let model = 'Unknown';
    let vendor = 'Unknown';

    // iPhone
    if (/iPhone/.test(userAgent)) {
        vendor = 'Apple';
        model = 'iPhone';
    }
    // iPad
    else if (/iPad/.test(userAgent)) {
        vendor = 'Apple';
        model = 'iPad';
    }
    // Samsung
    else if (/Samsung|SM-/.test(userAgent)) {
        vendor = 'Samsung';
        const match = userAgent.match(/SM-[A-Z0-9]+/);
        model = match ? match[0] : 'Galaxy';
    }
    // Huawei
    else if (/Huawei|HUAWEI/.test(userAgent)) {
        vendor = 'Huawei';
        model = 'Huawei Device';
    }
    // Xiaomi
    else if (/Xiaomi|Redmi|POCO/.test(userAgent)) {
        vendor = 'Xiaomi';
        model = 'Xiaomi Device';
    }
    // Mac
    else if (/Macintosh/.test(userAgent)) {
        vendor = 'Apple';
        model = 'Mac';
    }
    // Windows PC
    else if (/Windows/.test(userAgent)) {
        vendor = 'PC';
        model = 'Windows PC';
    }
    // Linux
    else if (/Linux/.test(userAgent)) {
        vendor = 'PC';
        model = 'Linux PC';
    }

    return { model, vendor };
};

export const useDeviceInfo = () => {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInfo = async () => {
            const { os, osVersion } = getOSInfo();
            const { browser, browserVersion } = getBrowserInfo();
            const deviceType = getDeviceType();
            const { model, vendor } = getDeviceInfo();

            // Get network info
            const nav = navigator as Navigator & {
                connection?: {
                    type?: string;
                    effectiveType?: string;
                    downlink?: number;
                };
                deviceMemory?: number;
            };

            const connection = nav.connection || {
                type: 'unknown',
                effectiveType: 'unknown',
                downlink: 0,
            };

            // Initial info without location and IP
            const info: DeviceInfo = {
                platform: navigator.platform || 'Unknown',
                os,
                osVersion,
                browser,
                browserVersion,
                deviceType,
                deviceModel: model,
                deviceVendor: vendor,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                screenColorDepth: window.screen.colorDepth,
                pixelRatio: window.devicePixelRatio || 1,
                hardwareConcurrency: navigator.hardwareConcurrency || 0,
                deviceMemory: nav.deviceMemory || 0,
                connectionType: connection.type || 'unknown',
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                latitude: null,
                longitude: null,
                locationError: null,
                language: navigator.language,
                languages: [...navigator.languages],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                cookiesEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack === '1',
                touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
                ipAddress: '',
                city: '',
                country: '',
            };

            setDeviceInfo(info);

            // Try to get IP info
            try {
                const ipResponse = await fetch('https://ipapi.co/json/');
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    setDeviceInfo(prev => prev ? {
                        ...prev,
                        ipAddress: ipData.ip || '',
                        city: ipData.city || '',
                        country: ipData.country_name || '',
                        latitude: ipData.latitude || null,
                        longitude: ipData.longitude || null,
                    } : null);
                }
            } catch {
                console.log('Could not fetch IP info');
            }

            setLoading(false);
        };

        getInfo();
    }, []);

    const requestLocation = async () => {
        if (!navigator.geolocation) {
            setDeviceInfo(prev => prev ? {
                ...prev,
                locationError: 'Geolocation dəstəklənmir',
            } : null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setDeviceInfo(prev => prev ? {
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    locationError: null,
                } : null);
            },
            (error) => {
                setDeviceInfo(prev => prev ? {
                    ...prev,
                    locationError: error.message,
                } : null);
            }
        );
    };

    return { deviceInfo, loading, requestLocation };
};
