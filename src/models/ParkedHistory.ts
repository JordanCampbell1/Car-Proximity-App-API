import { Schema, model } from 'mongoose';

// Define the sub-schema for GeoJSON data (Parked Location)
const GeoLocationSchema = new Schema({
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
});

// Main ParkedHistory Schema
const ParkedHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parkedLocation: {
    type: GeoLocationSchema, // Embedding the GeoLocation sub-schema here
    required: true,
  },
  frequency: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

// 2dsphere index for geospatial queries
ParkedHistorySchema.index({ parkedLocation: '2dsphere' });

export default model('ParkedHistory', ParkedHistorySchema);
