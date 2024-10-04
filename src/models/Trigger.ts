import { Schema, model } from 'mongoose';

const TriggerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: { type: String, default: 'Point' }, // GeoJSON Point
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  action: {
    type: String,
    required: true, // Action to take (e.g., "Send reminder", "Launch navigation")
  },
  radius: {
    type: Number,
    default: 500, // Radius in meters for proximity trigger
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('Trigger', TriggerSchema);
