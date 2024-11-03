import mongoose from 'mongoose';
import Reminder from '../src/models/Reminder';
import Location from '../src/models/Location';
import User from '../src/models/User';
import connectDB from '../src/config/db';
import ParkedHistory from '../src/models/ParkedHistory';
import DrivingHistory from '../src/models/DrivingHistory';

async function seedDatabase() {
  try {
    // Connect to the test database
    await connectDB();

    console.log('Connected to the database');

    // Drop the database if it exists
    const ProximityAPI_DB = mongoose.connection.db;
    if (ProximityAPI_DB) {
      await ProximityAPI_DB.dropDatabase();
    }

    // Seed data
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpassword' // Password will be hashed
    });

    await Reminder.create([
      {
        userId: user._id,
        message: 'Pick up groceries at Liguanea Plaza',
        location: {
          type: 'Point',
          coordinates: [-76.7499, 18.0127] // Coordinates for Liguanea, Kingston
        },
      },
      {
        userId: user._id,
        message: 'Return library books to UWI Library',
        location: {
          type: 'Point',
          coordinates: [-76.7462, 18.0056] // Coordinates for UWI, Mona
        },
      },
      {
        userId: user._id,
        message: 'Attend yoga class',
        location: {
          type: 'Point',
          coordinates: [-76.7925, 18.0321] // Coordinates for New Kingston
        },
      },
    ]);

    await Location.create([
      {
        userId: user._id,
        name: 'Extreme Fitness Gym',
        location: {
          type: 'Point',
          coordinates: [-76.7914, 18.0111] // Coordinates for Half-Way-Tree
        },
        radius: 500,
        placeType: 'gym',
      },
      {
        userId: user._id,
        name: 'Sovereign Supermarket',
        location: {
          type: 'Point',
          coordinates: [-76.7481, 18.0128] // Coordinates for Sovereign Centre
        },
        radius: 500,
        placeType: 'store',
      },
      {
        userId: user._id,
        name: 'Emancipation Park',
        location: {
          type: 'Point',
          coordinates: [-76.7825, 18.0109] // Coordinates for Emancipation Park
        },
        radius: 800,
        placeType: 'park',
      },
    ]);

    // Create parked history entries
    await ParkedHistory.create([
      {
        userId: user._id,
        parkedLocation: {
          type: 'Point',
          coordinates: [-76.7488, 18.0123] // Near Sovereign Centre
        },
        frequency: 4,
      },
      {
        userId: user._id,
        parkedLocation: {
          type: 'Point',
          coordinates: [-76.7825, 18.0109] // Near Emancipation Park
        },
        frequency: 5,
      },
      {
        userId: user._id,
        parkedLocation: {
          type: 'Point',
          coordinates: [-76.7914, 18.0111] // Near Half-Way-Tree
        },
        frequency: 3,
      },
    ]);

    // Create driving history entries
    await DrivingHistory.create([
      {
        userId: user._id,
        drivingLocation: {
          type: 'Point',
          coordinates: [-76.8043, 18.0242] // Coordinates for Red Hills Road
        },
        frequency: 2,
      },
      {
        userId: user._id,
        drivingLocation: {
          type: 'Point',
          coordinates: [-76.7869, 18.0192] // Coordinates near Constant Spring Road
        },
        frequency: 3,
      },
      {
        userId: user._id,
        drivingLocation: {
          type: 'Point',
          coordinates: [-76.7462, 18.0056] // Near UWI Mona
        },
        frequency: 1,
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
