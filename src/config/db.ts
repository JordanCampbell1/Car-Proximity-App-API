// config/db.js
import { connect } from 'mongoose';
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await connect(mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    if(err instanceof Error)
    console.error(err.message);
    process.exit(1);
  }
};
export default connectDB;
