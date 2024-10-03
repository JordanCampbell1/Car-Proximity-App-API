import { Router } from 'express';
const router = Router();
import Trigger from '../models/Trigger.js';

// POST /api/triggers - Create a new trigger
router.post('/', async (req, res) => {
  const { userId, location, action, radius } = req.body;
  try {
    const newTrigger = new Trigger({ userId, location, action, radius });
    await newTrigger.save();
    res.status(201).json(newTrigger);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/triggers/:userId - Get all triggers for a user
router.get('/:userId', async (req, res) => {
  try {
    const triggers = await Trigger.find({ userId: req.params.userId });
    res.status(200).json(triggers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
