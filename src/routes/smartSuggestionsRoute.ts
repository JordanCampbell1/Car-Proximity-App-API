import { Router, Response } from 'express';
import ParkedHistory from '../models/ParkedHistory';
import Location from '../models/Location';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Helper function to analyze parking time
function analyzeParkingTime(createdAt: Date) {
  const hour = createdAt.getHours();
  const minute = createdAt.getMinutes();
  const day = createdAt.getDay();
  
  return {
    hour,
    minute,
    day,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
  };
}

router.get('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Get user's parking history sorted by frequency
    const parkedHistory = await ParkedHistory.find({ userId }).sort({ frequency: -1 });

    if (!parkedHistory.length) {
      res.status(200).json({ suggestions: [], message: 'No parking history found' });
      return;
    }

    // Get user's saved locations for additional context
    const userLocations = await Location.find({ userId });

    // Transform each parking history into a suggestion
    const suggestions = parkedHistory.map(history => {
      const timeInfo = analyzeParkingTime(history.createdAt);
      
      // Try to find matching saved location for additional context
      const nearbyLocation = userLocations.find(loc => 
        loc.location.coordinates[0] === history.parkedLocation.coordinates[0] &&
        loc.location.coordinates[1] === history.parkedLocation.coordinates[1]
      );

      return {
        type: 'time-based',
        location: {
          name: nearbyLocation?.name || 'Frequent Location',
          coordinates: history.parkedLocation.coordinates,
          placeType: nearbyLocation?.placeType || 'unknown',
          radius: nearbyLocation?.radius || 100
        },
        message: `You've parked here ${history.frequency} times, typically around ${
          timeInfo.hour.toString().padStart(2, '0')}:${
          timeInfo.minute.toString().padStart(2, '0')} on ${timeInfo.dayName}`,
        frequency: history.frequency
      };
    });

    // Return top 5 most frequent locations
    res.status(200).json(suggestions.slice(0, 5));

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;