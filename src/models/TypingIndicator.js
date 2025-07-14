"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const typingIndicatorSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    isTyping: {
        type: Boolean,
        default: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const TypingIndicator = mongoose_1.default.model('TypingIndicator', typingIndicatorSchema);
exports.default = TypingIndicator;
