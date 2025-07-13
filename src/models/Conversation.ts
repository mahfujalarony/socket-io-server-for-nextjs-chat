import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IUser } from './User'; // ধরে নিচ্ছি আপনার User মডেলের জন্য IUser ইন্টারফেস আছে

// সাব-ডকুমেন্টের জন্য ইন্টারফেস
export interface IUnreadCount {
  userId: Types.ObjectId | IUser;
  count: number;
}

// মূল কনভার্সেশন ডকুমেন্টের জন্য ইন্টারফেস
export interface IConversation extends Document {
  participants: (Types.ObjectId | IUser)[];
  type: 'direct' | 'group';
  groupName: string | null;
  groupAvatar: string | null;
  lastMessage: string | null;
  unreadCount: IUnreadCount[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  groupName: {
    type: String,
    trim: true,
    default: null
  },
  groupAvatar: {
    type: String,
    default: null
  },
  lastMessage: {
    type: String,
    default: null
  },
  unreadCount: [{
    _id: false, // অ্যারের এলিমেন্টের জন্য _id তৈরি বন্ধ করতে
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    count: { type: Number, default: 0 }
  }],
}, {
  // timestamps: true যোগ করলে createdAt এবং updatedAt ফিল্ড স্বয়ংক্রিয়ভাবে তৈরি ও আপডেট হবে
  timestamps: true 
});

const Conversation: Model<IConversation> = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;