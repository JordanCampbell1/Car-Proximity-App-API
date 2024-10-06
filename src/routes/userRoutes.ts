import { Router, Response, Request } from 'express';
const router = Router();
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import User from '../models/User';
import validateUser from '../middleware/validateMiddleware';
import { Types } from 'mongoose';
import { error } from 'console';

// Generate JWT Token
const generateToken = (id: Types.ObjectId): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if(!jwtSecret){
    throw new Error("JWT SECRET is not defined in environment variables");
  }

  return sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

// POST /api/users/register - Register a new user
router.post('/register', validateUser, async (req: Request, res: Response): Promise<void> => {

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    const user = await User.create({
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
    if(error instanceof Error)
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/login - Authenticate user and get token
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

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
    if(error instanceof Error)
    res.status(500).json({ error: error.message });
  }
});


//maybe use the auth middleware instead of implementing the auth here
// GET /api/users/profile - Get logged-in user's profile
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user details from token (normally you'd check this via middleware)
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
      return;
    }

    // Decode the token
    const decoded = verify(token, process.env.JWT_SECRET as string) as { id: string };

    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    if(error instanceof Error)
    res.status(500).json({ error: error.message });
  }
});

export default router;
