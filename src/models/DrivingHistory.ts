import { Schema, Types, model } from 'mongoose';

export interface IDrivingHistory extends Document {
  userId: Types.ObjectId;
  drivingLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  frequency: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const DrivingHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    drivingLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val: number[]) {
            return val.length === 2; // Ensure it has exactly 2 values for [longitude, latitude]
          },
          message: 'Coordinates must be an array of [longitude, latitude]',
        },
      },
    },
    frequency: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// 2d sphere index for geospatial queries
DrivingHistorySchema.index({ 'route.drivingLocation': '2dsphere' });

export default model<IDrivingHistory>('DrivingHistory', DrivingHistorySchema);
  



