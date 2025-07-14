"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const blockedUserSchema = new mongoose_1.default.Schema({
    blockedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blockedUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        maxlength: 200,
        default: ""
    },
    blockedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const BlockedUser = mongoose_1.default.model('BlockedUser', blockedUserSchema);
exports.default = BlockedUser;
