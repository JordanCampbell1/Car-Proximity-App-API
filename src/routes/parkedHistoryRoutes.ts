import { Router, Request, Response } from 'express';
import ParkedHistory from '../models/ParkedHistory';
import protect from '../middleware/authMiddleware';
import { Error } from 'mongoose';

const router = Router();

// Formula to calc distance between two coordinates in meters
function getDistance(coord1: number[], coord2: number[]): number {
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

// POST /api/parkedHistory - Create or update a parked history entry
router.post('/', protect, async (req: Request, res: Response): Promise<void> => {
  const { parkedLocation, frequency, userId }: { parkedLocation: {type: string, coordinates: number[] }, frequency?: number, userId: string } = req.body;
  
  if(!process.env.PROXIMITYTHRESHOLD){
    throw new Error("Proximity threshold was not set in the Environment variables");
  }
  
  const proximityThreshold: number = parseInt(process.env.PROXIMITYTHRESHOLD); // Example proximity threshold in meters

  try {
    // Check if a parked history entry with the same coordinates or close exists
    const existingEntry = await ParkedHistory.find({
      userId: userId,
    });

    let foundEntry: any = null; //could define a type in the schema maybe for this to not be 'any'

    if (existingEntry.length) {
      for (const entry of existingEntry) {
        const distance: number = getDistance(
          entry.parkedLocation?.coordinates, //can use '!' due to the existing entry check above => existingEntry.length
          parkedLocation.coordinates
        );
        if (distance <= proximityThreshold) {
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
        frequency: frequency, // Set the frequency or default to 1
      });

      try{
        await newParkedHistory.save();

      }catch(error){

        console.error(error);
        if(error instanceof Error)
        res.status(500).json({ error: error.message });

      }
      
      res.status(201).json(newParkedHistory);
    }
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/parkedHistory/user/:userId - Get all parked history entries for the logged-in user
router.get('/user/:userId', protect, async (req: any, res: Response) => {
  try {
    const parkedHistories = await ParkedHistory.find({ userId: req.params.userId });
    
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
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const parkedHistory = await ParkedHistory.findById(req.params.id.trim());
    if (!parkedHistory) {
      res.status(404).json({ error: 'Specific Parking history not found' });
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
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedParkedHistory = await ParkedHistory.findByIdAndDelete(req.params.id);
    if (!deletedParkedHistory) {
      res.status(404).json({ error: 'Parking history not found' });
      return;
    }
    res.status(200).json({ message: 'Parking history deleted successfully' });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});


export default router;
