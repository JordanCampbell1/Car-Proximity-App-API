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
        message: 'Pick up groceries',
        location: {
          type: 'Point',
          coordinates: [-76.7936, 18.0179], // Example coordinates in Kingston, Jamaica
        },
        radius: 500, // 500 meters proximity radius
      },
      {
        userId: user._id,
        message: 'Visit the bank',
        location: {
          type: 'Point',
          coordinates: [-76.8048, 18.0038], // Another example location in Kingston
        },
        radius: 300, // 300 meters proximity radius
      },
      {
        userId: user._id,
        message: 'Return library books',
        location: {
          type: 'Point',
          coordinates: [-76.7825, 18.0158], // Library location in Kingston
        },
        radius: 400, // 400 meters proximity radius
      },
      {
        userId: user._id,
        message: 'Gym session',
        location: {
          type: 'Point',
          coordinates: [-76.8095, 18.0122], // Gym location coordinates
        },
        radius: 200, // 200 meters proximity radius
      },
    ]);

    await ParkedHistory.create([
      {
        userId: user._id,
        parkedLocation: {
          type: 'Point',
          coordinates: [-76.7936, 18.0179], // Example coordinates in Kingston, Jamaica
        },
        frequency: 2, // Example frequency
      },
      {
        userId: user._id,
        parkedLocation: {
          type: 'Point',
          coordinates: [-76.8048, 18.0038], // Another example location
        },
        frequency: 1, // Example frequency
      },
      {
        userId: user._id,
        parkedLocation: {
          type: 'Point',
          coordinates: [-76.7825, 18.0158], // Library location coordinates
        },
        frequency: 3, // Example frequency
      },
      {
        userId: user._id,
        parkedLocation: {
          type: 'Point',
          coordinates: [-76.8095, 18.0122], // Gym location coordinates
        },
        frequency: 1, // Example frequency
      },
    ]);

    await Location.create([
      {
        name: 'University of the West Indies',
        location: {
          type: 'Point',
          coordinates: [-76.7952, 18.0148], // Example coordinates for UWI Mona
        },
        radius: 100, // Example radius in meters
        placeType: 'University',
        userId: user._id,
      },
      {
        name: 'Half Way Tree',
        location: {
          type: 'Point',
          coordinates: [-76.7947, 18.0122], // Example coordinates for Half Way Tree
        },
        radius: 200, // Example radius in meters
        placeType: 'Shopping',
        userId: user._id,
      },
      {
        name: 'National Gallery of Jamaica',
        location: {
          type: 'Point',
          coordinates: [-76.9735, 18.0024], // Example coordinates for the National Gallery
        },
        radius: 150, // Example radius in meters
        placeType: 'Cultural',
        userId: user._id,
      },
      {
        name: 'Emancipation Park',
        location: {
          type: 'Point',
          coordinates: [-76.9738, 18.0045], // Example coordinates for Emancipation Park
        },
        radius: 250, // Example radius in meters
        placeType: 'Park',
        userId: user._id,
      },
    ]);

    await DrivingHistory.create([
      {
        userId: user._id,
        drivingLocation: {
          type: 'Point',
          coordinates: [-76.7952, 18.0148], // Example coordinates for a driving location
        },
        frequency: 5, // Example frequency
      },
      {
        userId: user._id,
        drivingLocation: {
          type: 'Point',
          coordinates: [-76.7947, 18.0122], // Example coordinates for another driving location
        },
        frequency: 3, // Example frequency
      },
      {
        userId: user._id,
        drivingLocation: {
          type: 'Point',
          coordinates: [-76.9735, 18.0024], // Example coordinates for another driving location
        },
        frequency: 1, // Example frequency
      },
      {
        userId: user._id,
        drivingLocation: {
          type: 'Point',
          coordinates: [-76.9738, 18.0045], // Example coordinates for another driving location
        },
        frequency: 2, // Example frequency
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
