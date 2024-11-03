import { Router, Request, Response } from 'express';
const router = Router();
import Reminder from '../models/Reminder';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { calculateDistance, DistanceMatrixResponse, reverseGeocode } from '../utils/googleMapsUtils';
import { isWithinProximity } from '../utils/proximityUtils';



// In-memory object to track if user is inside proximity
const proximityStatus: { [key: string]: boolean } = {};

// Fetch proximity threshold from environment variables
const proximityThreshold = Number(process.env.PROXIMITY_THRESHOLD) || 500;

// POST /api/reminders - Create a new reminder for the logged-in user
router.post('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { message, location } = req.body;
  try {
    const newReminder = new Reminder({
      userId: req.user._id, // Use the logged-in user's ID
      message,
      location,
      radius: proximityThreshold // Set radius to the proximity threshold from environment variables
    });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/reminders - Get reminders for the logged-in user
router.get('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }); // Use the logged-in user's ID

    if (!reminders.length) {
      res.status(404).json({ error: "No Reminders found for this user" });
      return;
    }

    res.status(200).json(reminders);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/reminders/proximity - Get reminders if user is within proximity of a location
router.get('/proximity', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { lat, lng } = req.query; // User's current location

  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitude and longitude are required' });
    return;
  }

  try {
    // Find all reminders for the logged-in user
    const reminders = await Reminder.find({ userId: req.user._id });

    const proximityResults = [];

    for (const reminder of reminders) {
      // Ensure reminder.location exists and has coordinates
      if (!reminder.location || !reminder.location.coordinates || !reminder.radius) {
        continue;
      }

      // Check proximity for each location if reminder has multiple locations
      const isNearby = isWithinProximity(
        Number(lat),
        Number(lng),
        reminder.location.coordinates[1], // Reminder's lat
        reminder.location.coordinates[0], // Reminder's lng
        reminder.radius || proximityThreshold // Use reminder's radius or default to proximity threshold
      );

      // Proximity state tracking (entering/exiting)
      const reminderKey = `${req.user._id}-${reminder._id}`;
      const wasInProximity = proximityStatus[reminderKey] || false;

      if (isNearby && !wasInProximity) {
        // User has entered proximity, trigger "enter" notification
        proximityResults.push({
          reminder,
          status: 'entered', // Notify user has entered proximity
        });
        proximityStatus[reminderKey] = true; // Mark as inside proximity
      } else if (!isNearby && wasInProximity) {
        // User has exited proximity, trigger "exit" notification
        proximityResults.push({
          reminder,
          status: 'exited', // Notify user has exited proximity
        });
        proximityStatus[reminderKey] = false; // Mark as outside proximity
      } else if (isNearby && wasInProximity) {
        // User is still in proximity, trigger "within" notification
        proximityResults.push({
          reminder,
          status: 'within', // Notify user is within proximity
        });
      }
    }

    if (!proximityResults.length) {
      res.status(200).json({ message: 'No reminders in your proximity' });
      return;
    }

    res.status(200).json(proximityResults);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/reminders/proximity/nearest-reminder - Get closest reminder and distance to user's current location
router.get('/proximity/nearest-reminder', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { lat: userLat, lng: userLng } = req.query; // User's current location

  if (!userLat || !userLng) {
    res.status(400).json({ error: 'Latitude and longitude are required' });
    return;
  }
  try {

    const reminders = await Reminder.find({ userId: req.user._id });

    if (!reminders) {
      res.status(400).json({ error: "No Reminders in DB" })
      return;
    }

    let closestReminder;
    let shortestDistance: number = Infinity;

    const reminderLocations: string = reminders
      .map(reminder => {
        const [longitude, latitude] = reminder.location.coordinates;
        return `${latitude},${longitude}`;
      })
      .join("|");

    const userLocation: string = `${userLat},${userLng}`;


    const results = await calculateDistance(userLocation, reminderLocations);

    let count = 0;
    results.forEach((result: DistanceMatrixResponse) => {

      if (result.status === "OK" && result.distance.value < shortestDistance) {
        shortestDistance = result.distance.value;
        closestReminder = reminders[count];
      }
      count++;
    });

    res.status(200).json({ shortestDistance, closestReminder });


  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }



});

// PATCH /api/reminders/:id/complete - Mark a reminder as completed
router.patch('/:id/complete', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Find the reminder by ID and user ID to ensure it belongs to the logged-in user
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isCompleted: true },
      { new: true }
    );

    // Check if the reminder exists
    if (!reminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    res.status(200).json({ message: 'Reminder marked as completed', reminder });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/reminders/completed - Get only completed reminders for the logged-in user
router.get('/completed', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const completedReminders = await Reminder.find({
      userId: req.user._id,
      isCompleted: true,
    });

    if (!completedReminders.length) {
      res.status(404).json({ message: "No completed reminders found" });
      return;
    }

    res.status(200).json(completedReminders);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/reminders/incomplete - Get only incomplete reminders for the logged-in user
router.get('/incomplete', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const incompleteReminders = await Reminder.find({
      userId: req.user._id,
      isCompleted: false,
    });

    if (!incompleteReminders.length) {
      res.status(404).json({ message: "No incomplete reminders found" });
      return;
    }

    res.status(200).json(incompleteReminders);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
});



export default router;
