import { Schema, model, Document } from 'mongoose';

// Define the interface for the Reminder document
interface IReminder extends Document {
  userId: Schema.Types.ObjectId;
  message: string;
  location: {
    type: string;
    coordinates: [number, number]; // Longitude, Latitude
  };
  radius: number;
  isCompleted: boolean;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true, // GeoJSON Point
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  radius: {
    type: Number, // Proximity radius in meters
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a 2dsphere index for geospatial queries
ReminderSchema.index({ location: '2dsphere' });

export default model<IReminder>('Reminder', ReminderSchema);
