import mongoose from 'mongoose';
import Reminder from '../models/Reminder.js';
import Trigger from '../models/Trigger.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

async function seedDatabase() {
  try {
    // Connect to the test database
    await connectDB();

    console.log('Connected to the database');

    // Drop the database if it exists
    await mongoose.connection.db.dropDatabase();

    // Seed data
    const user = await User.create({ 
      name: 'Test User',      // Updated from username to name
      email: 'testuser@example.com', // Added email field for user
      password: 'testpassword' // Password will be hashed
    });

    await Reminder.create([
      {
        userId: user._id,
        message: 'Pick up groceries',
        location: {
          type: 'Point',
          coordinates: [-77.0369, 38.9072], // Example coordinates
        },
      },
      {
        userId: user._id,
        message: 'Return library books',
        location: {
          type: 'Point',
          coordinates: [-77.0421, 38.8951], // Example coordinates
        },
      },
    ]);

    await Trigger.create([
      {
        userId: user._id,
        location: {
          type: 'Point',
          coordinates: [-77.0369, 38.9072], // Example coordinates
        },
        action: 'Send reminder',
        radius: 300,
      },
      {
        userId: user._id,
        location: {
          type: 'Point',
          coordinates: [-77.0421, 38.8951], // Example coordinates
        },
        action: 'Launch navigation',
        radius: 500,
      },
    ]);

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
