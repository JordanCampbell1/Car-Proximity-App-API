import { Schema, model } from 'mongoose';
import { GeoLocationSchema } from './ParkedHistory';

const DrivingHistorySchema = new Schema({
    userId: {  
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
    drivingLocation: {  
      type: GeoLocationSchema, 
      required: true,
    },
    frequency: {
      type: Number,
      default: 1, 
    },
  }, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  });
  

// 2d sphere index for geospatial queries
DrivingHistorySchema.index({ 'route.drivingLocation': '2dsphere' });

export default model('DrivingHistory', DrivingHistorySchema);