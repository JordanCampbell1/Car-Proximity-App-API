import { Router } from 'express';
const router = Router();
import { sign, verify } from 'jsonwebtoken';
import { findOne, create, findById } from '../models/User';
import validateUser from '../middleware/validateMiddleware';

// Generate JWT Token
const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// POST /api/users/register - Register a new user
router.post('/register', validateUser, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await create({
      name,
      email,
      password, // Will be hashed in the pre-save hook
    });

    // Respond with user details and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/login - Authenticate user and get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/profile - Get logged-in user's profile
router.get('/profile', async (req, res) => {
  try {
    // Get user details from token (normally you'd check this via middleware)
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Decode the token
    const decoded = verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
