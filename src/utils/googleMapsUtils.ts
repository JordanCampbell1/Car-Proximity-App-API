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
                mode: 'driving',
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        
        // Log the full response to debug
        console.log('Full directions response:', JSON.stringify(response.data, null, 2));
        
        if (!response.data.routes || response.data.routes.length === 0) {
            throw new Error('No routes found');
        }
        
        // Return the complete first route with all its details
        return response.data.routes[0].legs[0];
    } catch (error) {
        console.error('Error fetching directions:', error);
        throw new Error('Failed to get directions');
    }
};

// Calculate the distance between two locations

export interface DistanceMatrixResponse {
    distance: {
      text: string;   // e.g., "39.8 km"
      value: number;  // e.g., 39816 (in meters)
    };
    duration: {
      text: string;   // e.g., "1 hour 32 mins"
      value: number;  // e.g., 5528 (in seconds)
    };
    status: string;   // e.g., "OK"
  }

export const calculateDistance = async (origin: string, destination: string): Promise<[DistanceMatrixResponse]> => {
    try {
        const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/distancematrix/json`, {
            params: {
                origins: origin,
                destinations: destination,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });
        return response.data.rows[0].elements; //make the calling function access the elements
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
