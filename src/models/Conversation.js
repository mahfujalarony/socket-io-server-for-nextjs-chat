"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const conversationSchema = new mongoose_1.Schema({
    participants: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            count: { type: Number, default: 0 }
        }],
}, {
    // timestamps: true যোগ করলে createdAt এবং updatedAt ফিল্ড স্বয়ংক্রিয়ভাবে তৈরি ও আপডেট হবে
    timestamps: true
});
const Conversation = mongoose_1.default.model('Conversation', conversationSchema);
exports.default = Conversation;
