"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const groupMemberSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'member'],
        default: 'member'
    },
    permissions: {
        canAddMembers: {
            type: Boolean,
            default: false
        },
        canRemoveMembers: {
            type: Boolean,
            default: false
        },
        canDeleteMessages: {
            type: Boolean,
            default: false
        },
        canEditGroup: {
            type: Boolean,
            default: false
        },
        canPinMessages: {
            type: Boolean,
            default: false
        }
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    leftAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
const GroupMember = mongoose_1.default.model('GroupMember', groupMemberSchema);
exports.default = GroupMember;
