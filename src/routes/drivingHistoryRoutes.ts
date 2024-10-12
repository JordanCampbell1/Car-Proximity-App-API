import { Router, Request, Response } from 'express';
import DrivingHistory from '../models/DrivingHistory';
import protect from '../middleware/authMiddleware'; 
import { getDistance } from '../utils/geoUtils'; 

const router = Router();

// POST /api/driving-history - Create a new driving history entry
router.post('/', protect, async (req: Request, res: Response): Promise<void> => {
  const { drivingLocation, frequency, userId }: { drivingLocation: { type: string; coordinates: number[] }; frequency?: number, userId: string } = req.body; // Define the structure of drivingLocation

  try {
    const newDrivingHistory = new DrivingHistory({
      userId: userId, // Use the logged-in user's ID
      drivingLocation,
      frequency: frequency ?? 1, // Default to 1 if not provided
    });

    await newDrivingHistory.save();
    res.status(201).json(newDrivingHistory);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// PATCH /api/driving-history/:id - Update driving history entry with a new location
router.patch('/:id', protect, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { drivingLocation }: { drivingLocation: { type: string; coordinates: number[] } } = req.body; // New driving location to be added
  const proximityThreshold = 50; // Define proximity threshold in meters

  try {
    const drivingHistory = await DrivingHistory.findById(id);
    if (!drivingHistory) {
        res.status(404).json({ message: 'Driving history not found' });
        return;
    }

    const distance = getDistance(drivingHistory.drivingLocation.coordinates, drivingLocation.coordinates);
    if (distance <= proximityThreshold) {
      // If the distance is within the threshold, increment frequency
      drivingHistory.frequency += 1; // Increment frequency
    } else {
      // If no close location found, update the drivingLocation to the new one
      drivingHistory.drivingLocation = {
        type: 'Point',
        coordinates: drivingLocation.coordinates,
      };
    }

    await drivingHistory.save();
    res.status(200).json(drivingHistory);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/driving-history - Get all driving history for the logged-in user
router.get('/', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const drivingHistories = await DrivingHistory.find({ userId: req.params.userId });
    res.status(200).json(drivingHistories);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/driving-history/trends - Analyze trends based on driving history
router.get('/trends', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const trends = await DrivingHistory.aggregate([
      { 
        $match: { userId: req.params.userId } 
      },
      {
        $group: {
          _id: "$drivingLocation.coordinates",
          totalFrequency: { $sum: "$frequency" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalFrequency: -1 } // Sort by total frequency
      }
    ]);

    res.status(200).json(trends);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/driving-history/optimized-route - Optimize route through set locations
router.get('/optimized-route', protect, async (req: Request, res: Response): Promise<void> => {
  const { locations } = req.query; // Expecting an array of location coordinates

  res.status(200).json({
    message: 'Optimized route based on the provided locations',
    locations, 
  });
});

export default router;
