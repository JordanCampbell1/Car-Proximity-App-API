import { Router, Request, Response } from 'express';
import ParkedHistory from '../models/ParkedHistory';
import Location from '../models/Location';
import { isWithinProximity } from '../utils/proximityUtils';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

const router = Router();

// GET /api/suggestions - Get smart suggestions for the logged-in user
router.get('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Get user's parking history
    const parkedHistory = await ParkedHistory.find({ userId });

    if (!parkedHistory.length) {
      res.status(200).json({ suggestions: [], message: 'No parking history found' });
      return;
    }

    // Get user's saved locations
    const userLocations = await Location.find({ userId });

    const suggestions: { type: string; location: any; message: string }[] = [];

    // Get frequently parked locations
    const frequentLocations = await getFrequentLocations(userId);

    // Analyze parking history and locations to create suggestions
    for (const history of parkedHistory) {
      const { parkedLocation, frequency } = history;

      // Check if the parking location is near any of the user's saved locations
      for (const location of userLocations) {
        if (isWithinProximity(
          parkedLocation.coordinates[1], 
          parkedLocation.coordinates[0], 
          location.location.coordinates[1], 
          location.location.coordinates[0], 
          location.radius
        )) {
          // If the location is within proximity, suggest navigating to it
          suggestions.push({
            type: 'navigation',
            location: location,
            message: `You often park near ${location.name}. Would you like to navigate there?`,
          });
          break;
        }
      }


      for (const frequentLocation of frequentLocations) {
        if (isWithinProximity(
          parkedLocation.coordinates[1], 
          parkedLocation.coordinates[0], 
          frequentLocation.coordinates[1], 
          frequentLocation.coordinates[0], 
          frequentLocation.radius
        )) {
          suggestions.push({
            type: 'reminder',
            location: frequentLocation,
            message: `You frequently visit this area. Would you like to set a reminder?`,
          });
          break;
        }
      }
    }

    res.status(200).json(suggestions);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// Helper function to find frequent locations based on parking history
async function getFrequentLocations(userId: string, threshold: number = 3): Promise<{ coordinates: number[]; radius: number; frequency: number }[]> {
  const frequentLocations = await ParkedHistory.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { coordinates: "$parkedLocation.coordinates" },
        frequency: { $sum: "$frequency" },
        radius: { $first: "$radius" }, // Note: You might need to add radius to ParkedHistory schema if needed
      },
    },
    { $match: { frequency: { $gte: threshold } } },
    {
      $project: {
        _id: 0,
        coordinates: "$_id.coordinates",
        radius: 1,
        frequency: 1,
      },
    },
  ]);

  return frequentLocations;
}

export default router;
