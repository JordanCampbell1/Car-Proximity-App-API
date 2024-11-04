import { Router, Request, Response } from 'express';
import DrivingHistory from '../models/DrivingHistory';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware'; 
import { isWithinProximity } from '../utils/proximityUtils';

const router = Router();

// POST /api/drivinghistory - Create a new driving history entry for the logged-in user
router.post('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { drivingLocation, frequency }: { drivingLocation: { type: string; coordinates: number[] }; frequency?: number } = req.body;

  try {
    const newDrivingHistory = new DrivingHistory({
      userId: req.user._id, // Use the logged-in user's ID
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

// PATCH /api/drivinghistory/:id - Update driving history entry with a new location
router.patch('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { drivingLocation }: { drivingLocation: { type: string; coordinates: number[] } } = req.body; // New driving location to be added
  const proximityThreshold = Number(process.env.PROXIMITY_THRESHOLD) || 100;

  try {
    const drivingHistory = await DrivingHistory.findById(id);
    if (!drivingHistory) {
      res.status(404).json({ message: 'Driving history not found' });
      return;
    }

    // Ensure the logged-in user is the owner of the driving history
    if (drivingHistory.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'You are not authorized to update this entry' });
      return;
    }

    // Extract coordinates from the current and new driving locations
    const [currentLat, currentLng] = drivingHistory.drivingLocation.coordinates;
    const [newLat, newLng] = drivingLocation.coordinates;

    // Use isWithinProximity to check if the new location is within proximity of the existing one
    if (isWithinProximity(currentLat, currentLng, newLat, newLng, proximityThreshold)) {
      // If the new location is within proximity, increment frequency
      drivingHistory.frequency += 1;
    } else {
      // If not within proximity, update the drivingLocation to the new one
      drivingHistory.drivingLocation = {
        type: 'Point',
        coordinates: [newLng, newLat],
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

// GET /api/drivinghistory - Get all driving history for the logged-in user
router.get('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const drivingHistories = await DrivingHistory.find({ userId: req.user._id }); // Use the logged-in user's ID
    res.status(200).json(drivingHistories);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/drivinghistory/trends - Analyze trends based on driving history for the logged-in user
router.get('/trends', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const trends = await DrivingHistory.aggregate([
      { 
        $match: { userId: req.user._id } // Match only the logged-in user's history
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

// GET /api/drivinghistory/optimized-route - Optimize route through set locations
router.get('/optimized-route', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { locations } = req.query; // array of location coordinates ?

  res.status(200).json({
    message: 'Optimized route based on the provided locations',
    locations, 
  });
});

// DELETE /api/drivinghistory/:id - Delete a specific driving history entry
router.delete('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const drivingHistory = await DrivingHistory.findOneAndDelete({
      _id: id,
      userId: req.user._id, // Ensure the logged-in user owns the entry
    });

    if (!drivingHistory) {
      res.status(404).json({ message: 'Driving history not found' });
      return;
    }

    res.status(200).json({ message: 'Driving history entry deleted successfully' });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
