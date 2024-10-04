import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
const { genSalt, hash, compare } = bcrypt;

// Define an interface for the User document
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
},
{
  timestamps: true
}
);


// Hash the password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Method to check if the entered password is correct
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await compare(enteredPassword, this.password);
};

export default model<IUser>('User', UserSchema);
