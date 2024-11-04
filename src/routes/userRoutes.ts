import { Router, Response, Request } from 'express';
const router = Router();
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import User from '../models/User';
import validateUser from '../middleware/validateMiddleware';
import { Types } from 'mongoose';
import { error } from 'console';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Import the custom request interface
import protect from '../middleware/authMiddleware'; // Import the protect middleware

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


// GET /api/users/profile - Get logged-in user's profile
router.get('/profile', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Since the protect middleware attaches the user to req, we can directly access it
    const user = req.user;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Return the user's profile details (without the password)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});

// PATCH /api/users/change-password - Change password for the logged-in user
router.patch('/change-password', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Find the authenticated user
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if current password is correct
    if (!(await user.matchPassword(currentPassword))) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password with the new one (will be hashed)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
