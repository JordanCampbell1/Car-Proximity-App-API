import { Router, Request, Response } from 'express';
const router = Router();
import Reminder from '../models/Reminder';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { calculateDistance } from '../utils/googleMapsUtils'; 
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

export default router;
