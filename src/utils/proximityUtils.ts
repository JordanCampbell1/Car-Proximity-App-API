// Check if user is within the proximity of a location (based on radius in meters)
export const isWithinProximity = (userLat: number, userLng: number, locationLat: number, locationLng: number, radius: number) => {
    const R = 6371000; // Radius of the earth in meters
    const dLat = deg2rad(locationLat - userLat);
    const dLng = deg2rad(locationLng - userLng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(locationLat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    return distance <= radius;
};

// Helper function to convert degrees to radians
const deg2rad = (deg: number) => deg * (Math.PI / 180);
