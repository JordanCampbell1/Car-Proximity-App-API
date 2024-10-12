import express, { json } from 'express';
import { config } from 'dotenv';
import connectDB from './config/db';
import locationRoutes from './routes/locationRoutes';
import reminderRoutes from './routes/reminderRoutes';
import errorHandler from './middleware/errorMiddleware';
import userRoutes from './routes/userRoutes';
import parkedHistoryRoutes from './routes/parkedHistoryRoutes'
import DrivingHistoryRoutes from './routes/drivingHistoryRoutes';

config();

const startServer = async (): Promise<void> => {
 await connectDB();


  const app = express();
  app.use(json());

  // Routes
  app.use('/api/users', userRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/parkedHistory', parkedHistoryRoutes);
  app.use('/api/drivingHistory', DrivingHistoryRoutes);

  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      message: 'Server is running and healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(errorHandler);


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port http://127.0.0.1:${PORT}`);
  });

}

startServer();
