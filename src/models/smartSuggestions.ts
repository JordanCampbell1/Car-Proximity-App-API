import { Schema, model, Document } from 'mongoose';

interface ISuggestion extends Document {
  userId: Schema.Types.ObjectId;
  type: 'navigation' | 'reminder';
  location: {
    name: string;
    coordinates: [number, number];
    radius: number;
  };
  message: string;
  createdAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['navigation', 'reminder'],
    required: true,
  },
  location: {
    name: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    radius: {
      type: Number,
      required: true,
    },
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 2dsphere index for geospatial queries
SuggestionSchema.index({ 'location.coordinates': '2dsphere' });

export default model<ISuggestion>('Suggestion', SuggestionSchema);

