import express, { json } from 'express';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import triggerRoutes from './routes/triggerRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

config();
await connectDB();

const app = express();
app.use(json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/reminders', reminderRoutes);

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
