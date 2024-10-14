import axios from 'axios';

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Reverse geocode (lat, lng) to get a human-readable address
export const reverseGeocode = async (lat: number, lng: number) => {
    try {
        const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
            params: {
                latlng: `${lat},${lng}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        return response.data.results[0].formatted_address;
    } catch (error) {
        console.error('Error with reverse geocoding:', error);
        throw new Error('Failed to reverse geocode location');
    }
};

// Get driving directions between two locations
export const getDirections = async (origin: string, destination: string) => {
    try {
        const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/directions/json`, {
            params: {
                origin,
                destination,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        return response.data.routes[0];
    } catch (error) {
        console.error('Error fetching directions:', error);
        throw new Error('Failed to get directions');
    }
};

// Calculate the distance between two locations
export const calculateDistance = async (origin: string, destination: string) => {
    try {
        const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/distancematrix/json`, {
            params: {
                origins: origin,
                destinations: destination,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        return response.data.rows[0].elements[0];
    } catch (error) {
        console.error('Error calculating distance:', error);
        throw new Error('Failed to calculate distance');
    }
};

// Search for nearby places
export const searchNearby = async (lat: number, lng: number, keyword: string) => {
    try {
        const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json`, {
            params: {
                location: `${lat},${lng}`,
                radius: process.env.SEARCH_RADIUS || 1500, 
                keyword,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        return response.data.results;
    } catch (error) {
        console.error('Error with nearby search:', error);
        throw new Error('Failed to search nearby places');
    }
};
