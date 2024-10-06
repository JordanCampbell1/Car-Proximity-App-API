import { Router, Request, Response } from 'express';
import Location from '../models/Location'; 
import protect from '../middleware/authMiddleware'; 

const router = Router();

// POST /api/locations - Create a new location (user must be logged in)
router.post('/', protect, async (req: Request, res: Response) => {
  const { name, location, radius, placeType, userId } = req.body;

  try {
    const newLocation = new Location({
      name,
      location,
      radius,
      placeType,
      userId,  // Use the logged-in user's ID
    });

    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/locations - Get all locations
router.get('/', async (req: Request, res: Response) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/locations/:id - Get a specific location by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const location = await Location.findById(req.params.id);
      if (!location) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      res.status(200).json(location);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      }
    }
  });
  
// GET /api/locations/user/:userId - Get all locations by user ID
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const locations = await Location.find({ userId: req.params.userId });

    if(!locations){
      res.status(404).json({error : "No locations found for this user"});
      return;
    }

    res.status(200).json(locations);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE /api/locations/:id - Delete a specific location by ID
router.delete('/:id', protect, async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedLocation = await Location.findByIdAndDelete(req.params.id);
      if (!deletedLocation) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      res.status(200).json({ message: 'Location deleted successfully' });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      }
    }
  });

export default router;
