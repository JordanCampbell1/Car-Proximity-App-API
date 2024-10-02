import express, { json } from 'express';
import { config } from 'dotenv';
import connectDB from './config/db';
import triggerRoutes from './routes/triggerRoutes';
import reminderRoutes from './routes/reminderRoutes';

config();
connectDB();

const app = express();
app.use(json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/reminders', reminderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
