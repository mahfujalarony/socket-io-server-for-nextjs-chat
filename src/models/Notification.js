"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'group_invite', 'mention', 'group_add', 'friend_request'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: null
    },
    relatedType: {
        type: String,
        enum: ['message', 'group', 'user', null],
        default: null
    },
    actionUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
const Notification = mongoose_1.default.model('Notification', notificationSchema);
exports.default = Notification;
