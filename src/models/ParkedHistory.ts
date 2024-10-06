import { Schema, model } from 'mongoose';

const ParkedHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  parkedLocation: {
    type: { 
      type: String, 
      enum: ['Point'], 
      required: true 
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      required: true,
    },
  },
  frequency: {
    type: Number,
    default: 0, // Frequency of parking at this location
  },
}, {
  timestamps: true, 
});

// 2dsphere index for geospatial queries
ParkedHistorySchema.index({ parkedLocation: '2dsphere' });

export default model('ParkedHistory', ParkedHistorySchema);
