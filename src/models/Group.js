"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const groupSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200,
        default: ""
    },
    groupImage: {
        type: String,
        default: null
    },
    admin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    maxMembers: {
        type: Number,
        default: 256
    },
    groupType: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    settings: {
        onlyAdminCanPost: {
            type: Boolean,
            default: false
        },
        onlyAdminCanAddMembers: {
            type: Boolean,
            default: false
        },
        messageDeleteTime: {
            type: Number, // in hours, 0 means no auto-delete
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
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
const Group = mongoose_1.default.model('Group', groupSchema);
exports.default = Group;
