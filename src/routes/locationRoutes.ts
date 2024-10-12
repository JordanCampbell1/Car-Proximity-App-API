import { Router, Request, Response } from 'express';
import Location from '../models/Location'; 
import protect from '../middleware/authMiddleware'; 
import { reverseGeocode, getDirections, calculateDistance, searchNearby } from '../utils/googleMapsUtils';
import { isWithinProximity } from '../utils/proximityUtils';

const router = Router();

  // ------------------- GOOGLE MAPS API ROUTES -------------------

// GET /api/locations/reverse-geocode - Reverse geocode lat/lng to an address
router.get('/reverse-geocode', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitude and longitude are required' });
    return;
  }
  try {
    const address = await reverseGeocode(Number(lat), Number(lng));
    res.json({ address });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reverse geocode' });
  }
});

// GET /api/locations/directions - Get driving directions between two locations
router.get('/directions', async (req: Request, res: Response) => {
  const { origin, destination } = req.query;
  if (!origin || !destination) {
    res.status(400).json({ error: 'Origin and destination are required' });
    return;
  }
  try {
    const directions = await getDirections(origin as string, destination as string);
    res.json(directions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

// GET /api/locations/distance - Calculate the distance between two locations
router.get('/distance', async (req: Request, res: Response) => {
  const { origin, destination } = req.query;
  if (!origin || !destination) {
    res.status(400).json({ error: 'Origin and destination are required' });
    return;
  }
  try {
    const distanceData = await calculateDistance(origin as string, destination as string);
    res.json(distanceData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate distance' });
  }
});

// GET /api/locations/search-nearby - Search nearby places based on a keyword
router.get('/search-nearby', async (req: Request, res: Response) => {
  const { lat, lng, keyword } = req.query;
  if (!lat || !lng || !keyword) {
    res.status(400).json({ error: 'Latitude, longitude, and keyword are required' });
    return;
  }
  try {
    const results = await searchNearby(Number(lat), Number(lng), keyword as string);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search nearby places' });
  }
});

// GET /api/locations/proximity - Check if user is within proximity of a specific location
router.get('/proximity', (req: Request, res: Response) => {
  const { userLat, userLng, locationLat, locationLng, radius } = req.query;
  if (!userLat || !userLng || !locationLat || !locationLng || !radius) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  const isNearby = isWithinProximity(
    Number(userLat),
    Number(userLng),
    Number(locationLat),
    Number(locationLng),
    Number(radius)
  );
  res.json({ isNearby });
});


// ------------------- LOCATION CRUD ROUTES -------------------

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
