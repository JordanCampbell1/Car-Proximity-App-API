import { Schema, model } from 'mongoose';

// Define the interface for GeoJSON data (Parked Location)
export interface IGeoLocation extends Document {
  type: 'Point';
  coordinates: [number, number]; // Array of exactly two numbers: [longitude, latitude]
}

interface IParkedHistory extends Document {
  userId: Schema.Types.ObjectId;
  parkedLocation: {
    type: 'Point';
    coordinates: [number, number]; // Array of two numbers: [longitude, latitude]
  };
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
}

const ParkedHistorySchema = new Schema<IParkedHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parkedLocation: {
    type: {
      type: String,
      enum: ['Point'], // Only 'Point' is allowed for GeoJSON
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers for [longitude, latitude]
      required: true,
      validate: {
        validator: function (val: number[]) {
          return val.length === 2; // Ensure it has exactly 2 values
        },
        message: 'Coordinates must be an array of [longitude, latitude]',
      },
    },
  },
  frequency: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// 2dsphere index for geospatial queries
ParkedHistorySchema.index({ parkedLocation: '2dsphere' });

// Create a model from the schema
export default model<IParkedHistory>('ParkedHistory', ParkedHistorySchema);


