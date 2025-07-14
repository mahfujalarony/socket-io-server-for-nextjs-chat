"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageStatusSchema = new mongoose_1.default.Schema({
    messageId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const MessageStatus = mongoose_1.default.model('MessageStatus', messageStatusSchema);
exports.default = MessageStatus;
