import { Schema, model } from 'mongoose';

const ReminderSchema = new Schema({
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
    type: { type: String, default: 'Point' }, // GeoJSON Point
    coordinates: {
      type: [Number],
      required: true,
    },
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

export default model('Reminder', ReminderSchema);
