import { Router, Response } from 'express';
import ParkedHistory from '../models/ParkedHistory';
import Location from '../models/Location';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { calculateDistance, getDirections, reverseGeocode } from '../utils/googleMapsUtils';

const router = Router();

interface DirectionStep {
    html_instructions: string;
    distance?: {
        text: string;
    };
    maneuver?: string;
}

function isNearTime(currentHour: number, currentMinute: number, targetHour: number, targetMinute: number, thresholdMinutes: number = 30): boolean {
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    const timeDifference = Math.abs(currentTotalMinutes - targetTotalMinutes);
    return timeDifference <= thresholdMinutes || (24 * 60 - timeDifference) <= thresholdMinutes;
}

router.get('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { currentLat, currentLng } = req.query;

        if (!currentLat || !currentLng) {
            res.status(400).json({ error: 'Current location is required' });
            return;
        }

        const userId = req.user._id;
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        // Get user's parking history
        const parkedHistory = await ParkedHistory.find({ userId });

        if (!parkedHistory.length) {
            res.status(200).json({
                suggestions: [],
                message: 'No location history found'
            });
            return;
        }

        const userLocations = await Location.find({ userId });
        const timeBasedSuggestions = [];

        for (const history of parkedHistory) {
            const parkingTime = new Date(history.createdAt);
            const parkingHour = parkingTime.getHours();
            const parkingMinute = parkingTime.getMinutes();

            if (isNearTime(currentHour, currentMinute, parkingHour, parkingMinute)) {
                try {
                    const nearbyLocation = userLocations.find(loc =>
                        loc.location.coordinates[0] === history.parkedLocation.coordinates[0] &&
                        loc.location.coordinates[1] === history.parkedLocation.coordinates[1]
                    );

                    const origin = `${currentLat},${currentLng}`;
                    const destination = `${history.parkedLocation.coordinates[1]},${history.parkedLocation.coordinates[0]}`;

                    // Get navigation information
                    const [distanceResults, directionsResult, currentAddress] = await Promise.all([
                        calculateDistance(origin, destination),
                        getDirections(origin, destination),
                        reverseGeocode(Number(currentLat), Number(currentLng))
                    ]);

                    console.log('Directions result:', JSON.stringify(directionsResult, null, 2));

                    // Extract and process steps
                    const navigationSteps = directionsResult?.steps?.map((step: DirectionStep) => {
                        // Log raw step data
                        console.log('Processing step:', step);
                        
                        const instruction = step.html_instructions
                            .replace(/<div[^>]*>/g, ' ') // Replace div tags with space
                            .replace(/<[^>]*>/g, '') // Remove all other HTML tags
                            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                            .trim();
                        
                        return {
                            instruction: instruction || 'Continue straight',
                            distance: step.distance?.text || ''
                        };
                    }) || [];

                    console.log('Processed navigation steps:', navigationSteps);

                    timeBasedSuggestions.push({
                        type: 'time-based',
                        location: {
                            name: nearbyLocation?.name || 'Frequent Location',
                            coordinates: history.parkedLocation.coordinates,
                            placeType: nearbyLocation?.placeType || 'unknown',
                            radius: nearbyLocation?.radius || 100
                        },
                        navigation: {
                            currentLocation: currentAddress,
                            distance: distanceResults[0]?.distance?.text || 'Unknown distance',
                            duration: distanceResults[0]?.duration?.text || 'Unknown duration',
                            steps: navigationSteps,
                            overview: directionsResult?.summary || ''
                        },
                        message: `You typically visit ${nearbyLocation?.name || 'this location'} at ${
                            parkingHour.toString().padStart(2, '0')}:${
                            parkingMinute.toString().padStart(2, '0')}. Would you like to go there now?`,
                        frequency: history.frequency
                    });
                } catch (error) {
                    console.error('Error processing location:', error);
                    console.error('Error details:', error instanceof Error ? error.message : error);
                    continue;
                }
            }
        }

        // Sort by frequency and get top 3
        const topSuggestions = timeBasedSuggestions
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 3);

        res.status(200).json(topSuggestions);

    } catch (err) {
        console.error('Route error:', err);
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

export default router;