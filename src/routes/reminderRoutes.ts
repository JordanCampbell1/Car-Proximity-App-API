import { Router } from 'express';
const router = Router();
import Reminder from '../models/Reminder';

// POST /api/reminders - Create a new reminder
router.post('/', async (req, res) => {
  const { userId, message, location } = req.body;
  try {
    const newReminder = new Reminder({ userId, message, location });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (err) {
    if(err instanceof Error)
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reminders/:userId - Get reminders for a user
router.get('/:userId', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.params.userId });

    if(!reminders.length){
      res.status(404).json({error: "No Reminders found for this user"});
      return;
    }

    res.status(200).json(reminders);

  } catch (err) {
    if(err instanceof Error)
    res.status(500).json({ error: err.message });
  }
});

export default router;
