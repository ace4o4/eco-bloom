/**
 * Geolocation Service
 * Browser geolocation and distance calculations
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface LocationResult {
    coords: Coordinates;
    address?: string;
}

/**
 * Get user's current position
 */
export async function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                let errorMessage = 'Unable to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    });
}

/**
 * Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
 * Free, no API key required
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'EcoBloom/1.0', // Required by Nominatim
                },
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();

        // Format address
        const address = data.address;
        const parts = [];

        if (address.city || address.town || address.village) {
            parts.push(address.city || address.town || address.village);
        }
        if (address.state) {
            parts.push(address.state);
        }
        if (address.country) {
            parts.push(address.country);
        }

        return parts.join(', ') || data.display_name.split(',').slice(0, 3).join(',');
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback to coords
    }
}

/**
 * Get location with address
 */
export async function getCurrentLocation(): Promise<LocationResult> {
    const coords = await getCurrentPosition();
    const address = await reverseGeocode(coords.lat, coords.lng);

    return {
        coords,
        address,
    };
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    point1: Coordinates,
    point2: Coordinates
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m away`;
    }
    return `${km}km away`;
}
