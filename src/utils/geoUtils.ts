// utils/geoUtils.ts

// Formula to calculate distance between two coordinates in meters
export function getDistance(coord1: number[], coord2: number[]): number {
  const R: number = 6371000; // Radius of the Earth in meters
  const lat1: number = coord1[1] * (Math.PI / 180); // Convert latitude from degrees to radians
  const lat2: number = coord2[1] * (Math.PI / 180); // Convert latitude from degrees to radians
  const deltaLat: number = (coord2[1] - coord1[1]) * (Math.PI / 180);
  const deltaLon: number = (coord2[0] - coord1[0]) * (Math.PI / 180);

  const a: number = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}
