import { Router, Request, Response } from 'express';
import ParkedHistory from '../models/ParkedHistory';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Error } from 'mongoose';
import { isWithinProximity } from '../utils/proximityUtils'; // Import the proximity check function

const router = Router();

// POST /api/parkedHistory - Create or update a parked history entry
router.post('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { parkedLocation, frequency }: { parkedLocation: { type: string, coordinates: number[] }, frequency?: number } = req.body;
  
  if(!process.env.PROXIMITYTHRESHOLD){
    throw new Error("Proximity threshold was not set in the Environment variables");
  }
  
  const proximityThreshold: number = parseInt(process.env.PROXIMITYTHRESHOLD); // Example proximity threshold in meters

  try {
    const userId = req.user._id; // Use the logged-in user's ID

    // Check if a parked history entry with the same coordinates or close exists
    const existingEntry = await ParkedHistory.find({
      userId: userId,
    });

    let foundEntry: any = null; //could define a type in the schema maybe for this to not be 'any'

    if (existingEntry.length) {
      for (const entry of existingEntry) {
        const [entryLat, entryLng] = entry.parkedLocation?.coordinates;
        const [parkedLat, parkedLng] = parkedLocation.coordinates;

        // Use isWithinProximity instead of getDistance
        if (isWithinProximity(entryLat, entryLng, parkedLat, parkedLng, proximityThreshold)) {
          foundEntry = entry;
          break; // Exit the loop if a close entry is found
        }
      }
    }


    if (foundEntry) {
      // If it exists within the proximity threshold, increment the frequency
      foundEntry.frequency += (frequency || 1);
      await foundEntry.save();
      res.status(200).json(foundEntry);
    } else {
      // If it does not exist, create a new parked history entry
      const newParkedHistory = new ParkedHistory({
        userId,
        parkedLocation,
        frequency: frequency || 1, // Set the frequency or default to 1
      });

      try {
        await newParkedHistory.save();
        res.status(201).json(newParkedHistory);
      } catch (error) {
        console.error(error);
        if (error instanceof Error)
          res.status(500).json({ error: error.message });
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/parkedHistory - Get all parked history entries for the logged-in user
router.get('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id; // Use the logged-in user's ID
    const parkedHistories = await ParkedHistory.find({ userId });

    if (!parkedHistories.length) {
      res.status(404).json({ error: 'No Parking histories were found' });
      return;
    }

    res.status(200).json(parkedHistories);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/parkedHistory/:id - Get a specific parked history entry by ID
router.get('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parkedHistory = await ParkedHistory.findById(req.params.id.trim());
    if (!parkedHistory || parkedHistory.userId.toString() !== req.user._id.toString()) {
      res.status(404).json({ error: 'Specific Parking history not found or access denied' });
      return;
    }
    res.status(200).json(parkedHistory);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE /api/parkedHistory/:id - Delete a specific parked history entry by ID
router.delete('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parkedHistory = await ParkedHistory.findById(req.params.id);
    if (!parkedHistory || parkedHistory.userId.toString() !== req.user._id.toString()) {
      res.status(404).json({ error: 'Parking history not found or access denied' });
      return;
    }

    await ParkedHistory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Parking history deleted successfully' });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});


export default router;
