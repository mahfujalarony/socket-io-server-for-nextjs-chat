import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar: string | null;
  bio: string;
  phoneNumber: string | null;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  firebaseUid?: string;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firebaseUid: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ""
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;