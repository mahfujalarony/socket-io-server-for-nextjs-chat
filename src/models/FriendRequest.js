"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const friendRequestSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 200,
        default: ""
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
const FriendRequest = mongoose_1.default.model('FriendRequest', friendRequestSchema);
exports.default = FriendRequest;
