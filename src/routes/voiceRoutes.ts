import { Request, Response, Router } from 'express';
import Reminder from '../models/Reminder';
import protect, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { reverseGeocode } from '../utils/googleMapsUtils';
import ParkedHistory from '../models/ParkedHistory';
const router = Router();

// "tasks near me" - handled by GET /api/reminders/proximity
// "what is my next task?" - handled by GET /api/reminders/proximity/nearest-reminder

router.post('/voice-command', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { command } = req.body;

    try {
        switch (true) {
            case command.includes("frequent destinations"):
                const frequentLocations = await ParkedHistory.find({ userId: req.user._id }).sort({ frequency: -1 }).limit(3);

                // console.log(frequentLocations);

                if (frequentLocations.length > 0) {
                    // Get addresses for each location
                    const destinations = await Promise.all(frequentLocations.map(async (location): Promise<string> => {
                        const [longitude, latitude] = location.parkedLocation.coordinates;
                        // console.log(`longitude: ${longitude} and latitiude: ${latitude}`);
                        return await reverseGeocode(latitude, longitude); //can possibly be optimized if the google api accepts multiple locations in query
                    }));

                    res.json({ response: `Your frequent destinations include: ${destinations.join("|||")}.` });
                } else {
                    res.json({ response: "No frequent destinations found." });
                }
                break;



            case command.includes("tasks"): {
                // Fetch all reminders for the user by userId
                const reminders = await Reminder.find({ userId: req.user._id }).lean();

                if (reminders.length > 0) {
                    // Extract each message from the reminders array
                    const taskMessages = reminders.map((reminder) => reminder.message);

                    // Generate a natural response depending on the number of tasks
                    const responseMessage = taskMessages.length === 1
                        ? `Your task: ${taskMessages[0]}.`
                        : `Your tasks: ${taskMessages.join(", ")}.`;

                    res.json({ response: responseMessage });
                } else {
                    // Handle case where there are no reminders
                    res.json({ response: "You have no tasks at the moment." });
                }
                break;
            }

            default:
                res.json({ response: "I didn't understand that command." });
                break;
        }
    } catch (error) {
        console.error("Error processing command:", error);
        res.status(500).json({ response: "An error occurred while processing your request." });
    }
});

export default router;
