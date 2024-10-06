import mongoose, { Schema } from 'mongoose';

const locationSchema = new Schema({
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true }, //maybe we should make type redundant if the only thing that can be there is 'Point'
    coordinates: { type: [Number], required: true }, 
  },
  radius: { type: Number, required: true },
  placeType: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true,  
  },
}, {
  timestamps: true,
});

// geo index for better performance when querying by location
locationSchema.index({ location: '2dsphere' });

// Check if model exists before defining it
const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);
export default Location;
