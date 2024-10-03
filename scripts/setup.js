import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

const execPromise = promisify(exec);
// Load environment variables from .env file
dotenv.config();


async function checkMongoDB() {
  try {
    // Attempt to connect to the MongoDB server
    await connectDB();
    console.log('MongoDB is running and connected.');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  } finally {
    // Disconnect after checking
    await mongoose.disconnect();
  }
}

async function runSeedScript() {
  try {
    // Execute the seed.js script
    await execPromise('node scripts/seed.js');
    console.log('Seed script executed successfully.');
  } catch (error) {
    console.error('Error executing seed script:', error);
  }
}

async function setup() {
  const isMongoDBRunning = await checkMongoDB();
  if (isMongoDBRunning) {
    await runSeedScript();
  } else {
    console.error('MongoDB is not running. Please start your MongoDB server and try again.');
  }
}

// Run the setup function
setup();
